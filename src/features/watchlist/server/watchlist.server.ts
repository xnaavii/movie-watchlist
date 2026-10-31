import {
	and,
	asc,
	count,
	desc,
	eq,
	exists,
	gte,
	inArray,
	isNull,
	lte,
	or,
	type SQL,
	sql,
} from "drizzle-orm";
import { db } from "#/db";
import { genre, media, mediaToGenre, watchlist } from "#/db/schema";
import { fetchMediaDetails } from "#/features/media/server/media.server";
import type { MediaItem, MediaRef, MediaType } from "#/features/media/types";
import { mediaKey, totalRuntime } from "#/features/media/utils";
import {
	normalizeYearRange,
	type WatchlistFilters,
} from "#/features/media/utils/filters";

export type WatchlistStatusInsert = typeof watchlist.$inferInsert.status;
export type WatchlistStatus = typeof watchlist.$inferSelect.status;
export type MediaRow = typeof media.$inferSelect;
export type NewMediaRow = typeof media.$inferInsert;

/** Matches the watchlist row for one title. */
const isWatchlistEntry = (userId: string, ref: MediaRef) =>
	and(
		eq(watchlist.userId, userId),
		eq(watchlist.tmdbId, ref.id),
		eq(watchlist.mediaType, ref.mediaType),
	);

const isMedia = (ref: MediaRef) =>
	and(eq(media.tmdbId, ref.id), eq(media.mediaType, ref.mediaType));

const joinMedia = and(
	eq(watchlist.tmdbId, media.tmdbId),
	eq(watchlist.mediaType, media.mediaType),
);

const joinMediaGenres = and(
	eq(watchlist.tmdbId, mediaToGenre.tmdbId),
	eq(watchlist.mediaType, mediaToGenre.mediaType),
);

/** The shape cards and rows read, from a stored media row. */
export function toMediaItem(row: MediaRow): MediaItem {
	return {
		id: row.tmdbId,
		mediaType: row.mediaType,
		title: row.title,
		posterPath: row.posterPath,
		backdropPath: row.backdropPath,
		releaseDate: row.releaseDate,
		voteAverage: row.voteAverage ?? undefined,
	};
}

export async function addToWatchlist(userId: string, ref: MediaRef) {
	return await db
		.insert(watchlist)
		.values({ userId, tmdbId: ref.id, mediaType: ref.mediaType })
		.onConflictDoNothing()
		.returning();
}

export async function deleteFromWatchlist(userId: string, ref: MediaRef) {
	const [deleted] = await db
		.delete(watchlist)
		.where(isWatchlistEntry(userId, ref))
		.returning();

	return deleted ?? null;
}

export async function updateWatchlistStatus({
	userId,
	ref,
	status,
}: {
	userId: string;
	ref: MediaRef;
	status: WatchlistStatusInsert;
}) {
	const watchedAt = status === "watched" ? new Date() : null;
	const [upserted] = await db
		.insert(watchlist)
		.values({
			userId,
			tmdbId: ref.id,
			mediaType: ref.mediaType,
			status,
			watchedAt,
		})
		.onConflictDoUpdate({
			target: [watchlist.userId, watchlist.tmdbId, watchlist.mediaType],
			set: { status, watchedAt, updatedAt: new Date() },
		})
		.returning();

	return upserted ?? null;
}

export async function addMediaWithGenres({
	newMedia,
	genres,
}: {
	newMedia: NewMediaRow;
	genres: { id: number; name: string }[];
}) {
	const [inserted] = await db
		.insert(media)
		.values(newMedia)
		.onConflictDoUpdate({
			target: [media.tmdbId, media.mediaType],
			set: {
				title: newMedia.title,
				posterPath: newMedia.posterPath,
				backdropPath: newMedia.backdropPath,
				releaseDate: newMedia.releaseDate,
				runtime: newMedia.runtime,
				voteAverage: newMedia.voteAverage,
			},
		})
		.returning();

	if (genres.length > 0) {
		await db.insert(genre).values(genres).onConflictDoNothing();

		const junctionRows = genres.map((g) => ({
			tmdbId: newMedia.tmdbId,
			mediaType: newMedia.mediaType,
			genreId: g.id,
		}));

		await db.insert(mediaToGenre).values(junctionRows).onConflictDoNothing();
	}

	return inserted;
}

export async function findOrCreateMedia(ref: MediaRef) {
	const [existing] = await db.select().from(media).where(isMedia(ref));

	if (existing) {
		const [{ genreCount }] = await db
			.select({ genreCount: count(mediaToGenre.genreId) })
			.from(mediaToGenre)
			.where(
				and(
					eq(mediaToGenre.tmdbId, ref.id),
					eq(mediaToGenre.mediaType, ref.mediaType),
				),
			);

		if (Number(genreCount) > 0) {
			return existing;
		}
	}

	const details = await fetchMediaDetails(ref);

	return await addMediaWithGenres({
		newMedia: {
			tmdbId: ref.id,
			mediaType: ref.mediaType,
			title: details.title,
			posterPath: details.posterPath,
			backdropPath: details.backdropPath,
			releaseDate: details.releaseDate,
			...detailsStats(details),
		},
		genres: details.genres ?? [],
	});
}

// Null means "not fetched yet"; TMDB's zeros are stored so they aren't refetched.
function detailsStats(details: Parameters<typeof totalRuntime>[0]) {
	return {
		runtime: totalRuntime(details),
		voteAverage: details.voteAverage ?? 0,
	};
}

/**
 * Titles saved before runtime and score were stored. Filled a few at a time so
 * one profile visit stays well under the Workers subrequest limit.
 */
export async function backfillMediaDetails(userId: string, limit = 10) {
	const missing = await db
		.select({ id: media.tmdbId, mediaType: media.mediaType })
		.from(watchlist)
		.innerJoin(media, joinMedia)
		.where(and(eq(watchlist.userId, userId), isNull(media.runtime)))
		// Watched titles first, they feed the watch time total.
		.orderBy(desc(watchlist.status), desc(watchlist.updatedAt))
		.limit(limit);

	await Promise.allSettled(
		missing.map(async (ref) => {
			const details = await fetchMediaDetails(ref);
			await db.update(media).set(detailsStats(details)).where(isMedia(ref));
		}),
	);
}

export async function selectStatsEntries(userId: string) {
	return await db
		.select({
			id: media.tmdbId,
			mediaType: media.mediaType,
			title: media.title,
			posterPath: media.posterPath,
			releaseDate: media.releaseDate,
			runtime: media.runtime,
			voteAverage: media.voteAverage,
			status: watchlist.status,
			addedAt: watchlist.addedAt,
			watchedAt: watchlist.watchedAt,
		})
		.from(watchlist)
		.innerJoin(media, joinMedia)
		.where(eq(watchlist.userId, userId));
}

export async function selectWatchlistGenreLinks(userId: string) {
	return await db
		.select({
			id: mediaToGenre.tmdbId,
			mediaType: mediaToGenre.mediaType,
			genreId: genre.id,
			name: genre.name,
		})
		.from(watchlist)
		.innerJoin(mediaToGenre, joinMediaGenres)
		.innerJoin(genre, eq(mediaToGenre.genreId, genre.id))
		.where(eq(watchlist.userId, userId));
}

export async function getWatchlistStatus(userId: string, ref: MediaRef) {
	const [existing] = await db
		.select({ status: watchlist.status })
		.from(watchlist)
		.where(isWatchlistEntry(userId, ref));

	return existing?.status ?? null;
}

function watchlistFilterConditions(
	userId: string,
	filters: WatchlistFilters,
): SQL[] {
	const conditions = [eq(watchlist.userId, userId)];
	if (filters.status) conditions.push(eq(watchlist.status, filters.status));
	if (filters.type) conditions.push(eq(watchlist.mediaType, filters.type));
	if (filters.genre) {
		conditions.push(
			exists(
				db
					.select()
					.from(mediaToGenre)
					.where(
						and(
							eq(mediaToGenre.tmdbId, media.tmdbId),
							eq(mediaToGenre.mediaType, media.mediaType),
							eq(mediaToGenre.genreId, filters.genre),
						),
					),
			),
		);
	}
	// Release dates are stored as YYYY-MM-DD text, so string bounds compare correctly.
	const { from, to } = normalizeYearRange(filters.from, filters.to);
	if (from) conditions.push(gte(media.releaseDate, `${from}-01-01`));
	if (to) conditions.push(lte(media.releaseDate, `${to}-12-31`));
	return conditions;
}

function watchlistOrder(sort: WatchlistFilters["sort"]): SQL[] {
	switch (sort) {
		case "title":
			return [asc(media.title)];
		case "newest":
			return [sql`${media.releaseDate} desc nulls last`];
		case "oldest":
			return [sql`${media.releaseDate} asc nulls last`];
		default:
			return [desc(watchlist.addedAt)];
	}
}

export async function selectUserWatchlistPage(
	userId: string,
	{
		limit,
		offset,
		filters = {},
	}: { limit: number; offset: number; filters?: WatchlistFilters },
) {
	const rows = await db
		.select()
		.from(watchlist)
		.innerJoin(media, joinMedia)
		.where(and(...watchlistFilterConditions(userId, filters)))
		// The id tiebreak keeps pages stable when sort values repeat.
		.orderBy(...watchlistOrder(filters.sort), asc(watchlist.id))
		.limit(limit)
		.offset(offset);

	return rows.map((row) => ({
		status: row.watchlist.status,
		media: toMediaItem(row.media),
	}));
}

/** Every saved title's status, keyed by mediaKey ("movie:550"). */
export async function selectUserWatchlistStatuses(
	userId: string,
): Promise<Record<string, WatchlistStatus>> {
	const rows = await db
		.select({
			id: watchlist.tmdbId,
			mediaType: watchlist.mediaType,
			status: watchlist.status,
		})
		.from(watchlist)
		.where(eq(watchlist.userId, userId));

	return Object.fromEntries(rows.map((row) => [mediaKey(row), row.status]));
}

/** Saved titles in a discover genre, whose ids differ for movies and TV. */
export async function selectWatchlistMediaByGenre(
	userId: string,
	genreIds: Record<MediaType, number[]>,
) {
	const matchesGenre = (Object.keys(genreIds) as MediaType[])
		.filter((mediaType) => genreIds[mediaType].length > 0)
		.map((mediaType) =>
			and(
				eq(mediaToGenre.mediaType, mediaType),
				inArray(mediaToGenre.genreId, genreIds[mediaType]),
			),
		);
	if (matchesGenre.length === 0) return [];

	const rows = await db
		.select({ media })
		.from(watchlist)
		.innerJoin(media, joinMedia)
		.innerJoin(mediaToGenre, joinMediaGenres)
		.where(and(eq(watchlist.userId, userId), or(...matchesGenre)))
		.orderBy(desc(watchlist.addedAt));

	// A title can sit in two of the genre's ids, e.g. Action and Adventure.
	const byKey = new Map(
		rows.map((row) => [mediaKey(toMediaItem(row.media)), row.media]),
	);
	return [...byKey.values()].map(toMediaItem);
}

export async function selectUserWatchlist(
	userId: string,
	mediaType?: MediaType,
) {
	const rows = await db
		.select()
		.from(watchlist)
		.innerJoin(media, joinMedia)
		.where(
			and(
				eq(watchlist.userId, userId),
				mediaType ? eq(watchlist.mediaType, mediaType) : undefined,
			),
		)
		.orderBy(desc(watchlist.addedAt));

	return rows.map((row) => ({
		status: row.watchlist.status,
		media: toMediaItem(row.media),
	}));
}

/** Adds titles saved as a guest. Existing account entries win. Returns how many were new. */
export async function importWatchlistEntries(
	userId: string,
	entries: (MediaRef & {
		status: WatchlistStatusInsert;
		addedAt: string;
		watchedAt: string | null;
	})[],
) {
	const results = await Promise.allSettled(
		entries.map((entry) => findOrCreateMedia(entry)),
	);
	const rows = entries
		.filter((_, i) => results[i]?.status === "fulfilled")
		.map((entry) => {
			const addedAt = new Date(entry.addedAt);
			const watchedAt = entry.watchedAt ? new Date(entry.watchedAt) : null;
			return {
				userId,
				tmdbId: entry.id,
				mediaType: entry.mediaType,
				status: entry.status,
				addedAt: Number.isNaN(addedAt.getTime()) ? new Date() : addedAt,
				watchedAt:
					watchedAt && !Number.isNaN(watchedAt.getTime()) ? watchedAt : null,
			};
		});
	if (rows.length === 0) return { imported: 0, failed: entries.length };

	const inserted = await db
		.insert(watchlist)
		.values(rows)
		.onConflictDoNothing()
		.returning({ id: watchlist.id });

	return { imported: inserted.length, failed: entries.length - rows.length };
}
