import type { DiscoverMovieParams, MovieResultItem } from "@lorenzopant/tmdb";
import type { TmdbGenre } from "#/features/movies/types";
import { normalizeText } from "#/features/movies/utils/search";
import {
	PICK_TIMES,
	type Pick,
	type PickCandidate,
	type PickIntent,
	type PickRanking,
	type PickRequest,
} from "../types";

const OVERVIEW_LENGTH = 220;
const MIN_DESCRIPTIVE_WORDS = 3;
// Words that only show up when someone describes what they want, not in titles.
const STRUCTURAL_CUES =
	/\b(movies?|films?|something|anything|like|about|where|under|set in|based on|\d0s|\d{4}s|hidden gem|underrated)\b/;
// Mood words also appear in plenty of titles ("The Dark Knight"), so they only
// count in longer queries.
const MOOD_CUES =
	/\b(cozy|funny|scary|sad|dark|light|feel good|mind bending|twist|vibes?|mood|date|kids|family|classic|chill|wholesome|tense)\b/;

/**
 * True when a search reads like a description ("cozy 90s mystery under 2
 * hours") rather than a title, so the search page can offer AI picks.
 */
export function looksLikeDescription(query: string): boolean {
	const normalized = normalizeText(query);
	const words = normalized.split(" ").filter(Boolean);
	if (words.length < MIN_DESCRIPTIVE_WORDS) return false;
	if (words.length >= 7 || STRUCTURAL_CUES.test(normalized)) return true;
	return words.length >= 4 && MOOD_CUES.test(normalized);
}

/** Turns the picker form into one plain sentence block for the model. */
export function describeRequest(request: PickRequest): string {
	const lines: string[] = [];
	if (request.prompt) lines.push(`Request: ${request.prompt}`);
	if (request.moods.length) lines.push(`Mood: ${request.moods.join(", ")}`);
	const time = PICK_TIMES.find((option) => option.value === request.time);
	if (time && time.value !== "any") lines.push(`Time: ${time.label}`);
	if (request.company) lines.push(`Watching with: ${request.company}`);
	return lines.join("\n") || "Request: something good to watch tonight";
}

/** Matches genre names from the model to TMDB ids, ignoring case and punctuation. */
export function genreIdsFromNames(
	names: string[],
	genres: TmdbGenre[],
): number[] {
	const byName = new Map(
		genres.map((genre) => [normalizeText(genre.name), genre.id]),
	);
	const ids = names
		.map((name) => byName.get(normalizeText(name)))
		.filter((id): id is number => id !== undefined);
	return [...new Set(ids)];
}

function clampYear(year: number | null): number | null {
	if (year === null) return null;
	const max = new Date().getFullYear() + 2;
	return Math.min(Math.max(year, 1900), max);
}

/** The runtime cap from the time pill wins over a looser one in the text. */
function maxRuntimeFor(intent: PickIntent, request: PickRequest) {
	const fromTime = PICK_TIMES.find(
		(option) => option.value === request.time,
	)?.maxRuntime;
	const caps = [intent.maxRuntime, fromTime].filter(
		(value): value is number => typeof value === "number" && value > 0,
	);
	return caps.length ? Math.min(...caps) : undefined;
}

/**
 * Builds discover filters from the intent. Genres are OR-ed so a two-genre
 * mix still finds enough candidates; the ranking step sorts out the fit.
 */
export function intentToDiscoverParams(
	intent: PickIntent,
	request: PickRequest,
	genres: TmdbGenre[],
	keywordIds: number[] = [],
): DiscoverMovieParams {
	const withGenres = genreIdsFromNames(intent.genres, genres);
	const withoutGenres = genreIdsFromNames(intent.excludeGenres, genres).filter(
		(id) => !withGenres.includes(id),
	);
	const from = clampYear(intent.releaseYearFrom);
	const to = clampYear(intent.releaseYearTo);
	const sortBy =
		intent.sort === "top_rated"
			? "vote_average.desc"
			: intent.sort === "newest"
				? "primary_release_date.desc"
				: "popularity.desc";

	return {
		with_genres: withGenres.length ? withGenres.join("|") : undefined,
		without_genres: withoutGenres.length ? withoutGenres.join(",") : undefined,
		with_keywords: keywordIds.length ? keywordIds.join("|") : undefined,
		"primary_release_date.gte": from ? `${from}-01-01` : undefined,
		"primary_release_date.lte": to ? `${to}-12-31` : undefined,
		"with_runtime.gte": intent.minRuntime ?? undefined,
		"with_runtime.lte": maxRuntimeFor(intent, request),
		"vote_average.gte": intent.minRating ?? undefined,
		"vote_count.gte": sortBy === "vote_average.desc" ? 300 : 50,
		with_original_language: intent.originalLanguage
			? (intent.originalLanguage.toLowerCase() as DiscoverMovieParams["with_original_language"])
			: undefined,
		sort_by: sortBy,
		include_adult: false,
	};
}

/**
 * Merges candidate lists in priority order, dropping duplicates, movies the
 * user has already watched, and ones without a poster.
 */
export function mergeCandidates(
	lists: MovieResultItem[][],
	excludeIds: Set<number>,
	limit: number,
): MovieResultItem[] {
	const merged = new Map<number, MovieResultItem>();
	for (const list of lists) {
		for (const movie of list) {
			if (merged.size >= limit) return [...merged.values()];
			if (
				!movie.poster_path ||
				excludeIds.has(movie.id) ||
				merged.has(movie.id)
			) {
				continue;
			}
			merged.set(movie.id, movie);
		}
	}
	return [...merged.values()];
}

export function toCandidate(
	movie: MovieResultItem,
	genres: TmdbGenre[],
	onWatchlist: boolean,
): PickCandidate {
	const names = new Map(genres.map((genre) => [genre.id, genre.name]));
	const overview =
		movie.overview.length > OVERVIEW_LENGTH
			? `${movie.overview.slice(0, OVERVIEW_LENGTH).trimEnd()}…`
			: movie.overview;
	return {
		id: movie.id,
		title: movie.title,
		year: movie.release_date?.slice(0, 4) || "unknown",
		genres: movie.genre_ids
			.map((id) => names.get(id))
			.filter((name): name is string => !!name),
		rating: Math.round(movie.vote_average * 10) / 10,
		overview,
		onWatchlist,
	};
}

/** Keeps only picks that point at a real candidate, in the model's order. */
export function resolvePicks(
	ranking: PickRanking,
	candidates: MovieResultItem[],
	watchlistIds: Set<number>,
	max: number,
): Pick[] {
	const byId = new Map(candidates.map((movie) => [movie.id, movie]));
	const seen = new Set<number>();
	const picks: Pick[] = [];
	for (const { id, reason } of ranking.picks) {
		const movie = byId.get(id);
		if (!movie || seen.has(id)) continue;
		seen.add(id);
		picks.push({
			mediaType: "movie",
			movie,
			reason: reason.trim(),
			onWatchlist: watchlistIds.has(id),
		});
		if (picks.length >= max) break;
	}
	return picks;
}
