import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "#/db";
import { atmosTitle, atmosVote, soundRating } from "#/db/schema";
import { tmdb } from "#/lib/tmdb";
import { ATMOS_SEED, type AtmosSeed, toSeedKey } from "../seed";
import type {
	AtmosShowcaseItem,
	AtmosVoteInput,
	SoundAggregate,
	SoundRatingInput,
	TitleRef,
	TitleSound,
} from "../types";
import {
	EMPTY_SOUND,
	isAtmosTitle,
	matchSeedResult,
	soundScore,
} from "../utils/sound";

/** Seeds resolved per request, to stay well under the Workers subrequest limit. */
const SEED_RESOLVE_BATCH = 8;

const titleMatch = (
	table: typeof atmosVote | typeof soundRating | typeof atmosTitle,
	ref: TitleRef,
) => and(eq(table.tmdbId, ref.tmdbId), eq(table.mediaType, ref.mediaType));

type TitleMeta = {
	title: string;
	releaseDate: string | null;
	posterPath: string | null;
	backdropPath: string | null;
};

async function searchSeed(seed: AtmosSeed) {
	if (seed.mediaType === "movie") {
		const { results } = await tmdb.search.movies({
			query: seed.title,
			year: String(seed.year),
		});
		const match = matchSeedResult(seed, results);
		return match
			? {
					tmdbId: match.id,
					title: match.title,
					releaseDate: match.release_date || null,
					posterPath: match.poster_path ?? null,
					backdropPath: match.backdrop_path ?? null,
				}
			: null;
	}

	const { results } = await tmdb.search.tv_series({
		query: seed.title,
		first_air_date_year: seed.year,
	});
	const match = matchSeedResult(seed, results);
	return match
		? {
				tmdbId: match.id,
				title: match.name,
				releaseDate: match.first_air_date || null,
				posterPath: match.poster_path ?? null,
				backdropPath: match.backdrop_path ?? null,
			}
		: null;
}

/** How long a Worker skips the seed check after finding nothing to do. */
const SEED_CHECK_INTERVAL_MS = 60 * 60 * 1000;
let seedsSettledAt = 0;
/** Seeds TMDB had no match for, so they aren't searched on every request. */
const unmatchedSeeds = new Set<string>();

/** Turns a few not-yet-stored seed entries into atmos_title rows. */
export async function resolvePendingSeeds() {
	if (Date.now() - seedsSettledAt < SEED_CHECK_INTERVAL_MS) return;

	const stored = await db
		.select({ seedKey: atmosTitle.seedKey })
		.from(atmosTitle)
		.where(isNotNull(atmosTitle.seedKey));
	const storedKeys = new Set(stored.map((row) => row.seedKey));

	const pending = ATMOS_SEED.filter((seed) => {
		const key = toSeedKey(seed);
		return !storedKeys.has(key) && !unmatchedSeeds.has(key);
	}).slice(0, SEED_RESOLVE_BATCH);

	if (pending.length === 0) {
		seedsSettledAt = Date.now();
		return;
	}

	const resolved = await Promise.allSettled(
		pending.map(async (seed) => {
			const match = await searchSeed(seed);
			if (!match) {
				unmatchedSeeds.add(toSeedKey(seed));
				console.warn(`Atmos seed not found on TMDB: ${toSeedKey(seed)}`);
				return;
			}
			await db
				.insert(atmosTitle)
				.values({
					...match,
					mediaType: seed.mediaType,
					source: "curated",
					seedKey: toSeedKey(seed),
					note: seed.note,
				})
				// A community title that later joins the seed list becomes curated.
				.onConflictDoUpdate({
					target: [atmosTitle.tmdbId, atmosTitle.mediaType],
					set: {
						source: "curated",
						seedKey: toSeedKey(seed),
						note: seed.note,
					},
				});
		}),
	);

	for (const result of resolved) {
		if (result.status === "rejected") {
			console.error("Failed to resolve Atmos seed", result.reason);
		}
	}
}

async function voteCounts(refs?: TitleRef[]) {
	const rows = await db
		.select({
			tmdbId: atmosVote.tmdbId,
			mediaType: atmosVote.mediaType,
			yes: sql<number>`count(*) filter (where ${atmosVote.hasAtmos})`.mapWith(
				Number,
			),
			no: sql<number>`count(*) filter (where not ${atmosVote.hasAtmos})`.mapWith(
				Number,
			),
		})
		.from(atmosVote)
		.where(
			refs
				? inArray(
						atmosVote.tmdbId,
						refs.map((r) => r.tmdbId),
					)
				: undefined,
		)
		.groupBy(atmosVote.tmdbId, atmosVote.mediaType);

	return new Map(rows.map((r) => [`${r.mediaType}:${r.tmdbId}`, r]));
}

async function ratingAggregates(refs: TitleRef[]) {
	if (refs.length === 0) return new Map<string, SoundAggregate>();

	const avg = (column: AnyPgColumn) =>
		sql<number | null>`avg(${column})`.mapWith((v) =>
			v == null ? null : Number(v),
		);
	const rows = await db
		.select({
			tmdbId: soundRating.tmdbId,
			mediaType: soundRating.mediaType,
			count: sql<number>`count(*)`.mapWith(Number),
			overall: avg(soundRating.overall),
			immersion: avg(soundRating.immersion),
			bass: avg(soundRating.bass),
			dialogue: avg(soundRating.dialogue),
		})
		.from(soundRating)
		.where(
			inArray(
				soundRating.tmdbId,
				refs.map((r) => r.tmdbId),
			),
		)
		.groupBy(soundRating.tmdbId, soundRating.mediaType);

	return new Map(
		rows.map(({ tmdbId, mediaType, ...sound }) => [
			`${mediaType}:${tmdbId}`,
			sound,
		]),
	);
}

export async function selectAtmosShowcase(): Promise<AtmosShowcaseItem[]> {
	const titles = await db.select().from(atmosTitle);
	const [votes, ratings] = await Promise.all([
		voteCounts(titles),
		ratingAggregates(titles),
	]);

	return titles.flatMap((row) => {
		const key = `${row.mediaType}:${row.tmdbId}`;
		const vote = votes.get(key) ?? { yes: 0, no: 0 };
		if (!isAtmosTitle({ curated: row.source === "curated", ...vote })) {
			return [];
		}

		const sound = ratings.get(key) ?? EMPTY_SOUND;
		return [
			{
				tmdbId: row.tmdbId,
				mediaType: row.mediaType,
				title: row.title,
				releaseDate: row.releaseDate,
				posterPath: row.posterPath,
				backdropPath: row.backdropPath,
				note: row.note,
				sound,
				score: soundScore(sound),
			},
		];
	});
}

export async function selectTitleSound(
	ref: TitleRef,
	userId: string | null,
): Promise<TitleSound> {
	const [[stored], votes, ratings, [myRow]] = await Promise.all([
		db.select().from(atmosTitle).where(titleMatch(atmosTitle, ref)),
		voteCounts([ref]),
		ratingAggregates([ref]),
		userId
			? db
					.select()
					.from(soundRating)
					.where(
						and(eq(soundRating.userId, userId), titleMatch(soundRating, ref)),
					)
			: Promise.resolve([]),
	]);

	const key = `${ref.mediaType}:${ref.tmdbId}`;
	const vote = votes.get(key) ?? { yes: 0, no: 0 };
	const curated = stored?.source === "curated";

	let myVote: boolean | null = null;
	if (userId) {
		const [mine] = await db
			.select({ hasAtmos: atmosVote.hasAtmos })
			.from(atmosVote)
			.where(and(eq(atmosVote.userId, userId), titleMatch(atmosVote, ref)));
		myVote = mine?.hasAtmos ?? null;
	}

	return {
		isAtmos: isAtmosTitle({ curated, yes: vote.yes, no: vote.no }),
		curatedNote: curated ? (stored?.note ?? null) : null,
		votes: { yes: vote.yes, no: vote.no },
		sound: ratings.get(key) ?? EMPTY_SOUND,
		myVote,
		myRating: myRow
			? {
					overall: myRow.overall,
					immersion: myRow.immersion,
					bass: myRow.bass,
					dialogue: myRow.dialogue,
					setup: myRow.setup,
				}
			: null,
	};
}

/** Stores title details so community-voted titles can show up in the showcase. */
export async function ensureAtmosTitle(ref: TitleRef, meta: TitleMeta) {
	await db
		.insert(atmosTitle)
		.values({ ...ref, ...meta, source: "community" })
		.onConflictDoNothing();
}

export async function fetchTitleMeta(ref: TitleRef): Promise<TitleMeta> {
	if (ref.mediaType === "movie") {
		const movie = await tmdb.movies.details({ movie_id: ref.tmdbId });
		return {
			title: movie.title,
			releaseDate: movie.release_date || null,
			posterPath: movie.poster_path ?? null,
			backdropPath: movie.backdrop_path ?? null,
		};
	}
	const show = await tmdb.tv_series.details({ series_id: ref.tmdbId });
	return {
		title: show.name,
		releaseDate: show.first_air_date || null,
		posterPath: show.poster_path ?? null,
		backdropPath: show.backdrop_path ?? null,
	};
}

export async function upsertAtmosVote(userId: string, input: AtmosVoteInput) {
	await db
		.insert(atmosVote)
		.values({ userId, ...input })
		.onConflictDoUpdate({
			target: [atmosVote.userId, atmosVote.tmdbId, atmosVote.mediaType],
			set: { hasAtmos: input.hasAtmos, updatedAt: new Date() },
		});
}

export async function upsertSoundRating(
	userId: string,
	input: SoundRatingInput,
) {
	const { tmdbId, mediaType, ...scores } = input;
	await db
		.insert(soundRating)
		.values({ userId, tmdbId, mediaType, ...scores })
		.onConflictDoUpdate({
			target: [soundRating.userId, soundRating.tmdbId, soundRating.mediaType],
			set: { ...scores, updatedAt: new Date() },
		});
}

export async function deleteSoundRating(userId: string, ref: TitleRef) {
	await db
		.delete(soundRating)
		.where(and(eq(soundRating.userId, userId), titleMatch(soundRating, ref)));
}

export async function titleIsStored(ref: TitleRef) {
	const [row] = await db
		.select({ tmdbId: atmosTitle.tmdbId })
		.from(atmosTitle)
		.where(titleMatch(atmosTitle, ref));
	return Boolean(row);
}
