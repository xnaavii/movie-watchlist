import type { MovieResultItem } from "@lorenzopant/tmdb";
import { z } from "zod";

export const SEARCH_SORTS = [
	"relevance",
	"popularity",
	"rating",
	"newest",
	"oldest",
	"title",
] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

export const WATCHLIST_SORTS = ["added", "title", "newest", "oldest"] as const;
export type WatchlistSort = (typeof WATCHLIST_SORTS)[number];

export const WATCHLIST_STATUSES = ["want_to_watch", "watched"] as const;

export const SORT_LABELS: Record<SearchSort | WatchlistSort, string> = {
	relevance: "Best match",
	popularity: "Most popular",
	rating: "Highest rated",
	newest: "Newest first",
	oldest: "Oldest first",
	title: "Title A–Z",
	added: "Recently added",
};

/** Movies with fewer votes than this sort after rated ones and fail a minimum rating. */
export const MIN_RATING_VOTES = 20;

const optionalInt = z.coerce
	.number()
	.int()
	.positive()
	.optional()
	.catch(undefined);

/** Search params shared by every page that has the filter bar. */
export const movieFilterSearchSchema = z.object({
	genre: optionalInt,
	from: optionalInt,
	to: optionalInt,
});

export const searchFilterSearchSchema = movieFilterSearchSchema.extend({
	rating: z.coerce.number().min(1).max(9).optional().catch(undefined),
	sort: z.enum(SEARCH_SORTS).optional().catch(undefined),
});
export type SearchFilters = z.infer<typeof searchFilterSearchSchema>;

export const watchlistFilterSearchSchema = movieFilterSearchSchema.extend({
	status: z.enum(WATCHLIST_STATUSES).optional().catch(undefined),
	sort: z.enum(WATCHLIST_SORTS).optional().catch(undefined),
});
export type WatchlistFilters = z.infer<typeof watchlistFilterSearchSchema>;

/** Swaps the year bounds when they were picked in the wrong order. */
export function normalizeYearRange(from?: number, to?: number) {
	if (from && to && from > to) return { from: to, to: from };
	return { from, to };
}

export function releaseYear(releaseDate: string | null | undefined) {
	const year = Number(releaseDate?.slice(0, 4));
	return Number.isFinite(year) && year > 0 ? year : undefined;
}

export function hasActiveFilters(filters: Record<string, unknown>) {
	return Object.values(filters).some((value) => value !== undefined);
}

function compareRating(a: MovieResultItem, b: MovieResultItem) {
	const aRated = a.vote_count >= MIN_RATING_VOTES;
	const bRated = b.vote_count >= MIN_RATING_VOTES;
	if (aRated !== bRated) return aRated ? -1 : 1;
	return b.vote_average - a.vote_average || b.vote_count - a.vote_count;
}

function compareRelease(a: MovieResultItem, b: MovieResultItem) {
	// Undated movies sort last whichever direction is picked.
	if (!a.release_date || !b.release_date) {
		return Number(!a.release_date) - Number(!b.release_date);
	}
	return a.release_date.localeCompare(b.release_date);
}

/**
 * Filters and sorts TMDB results on the client. TMDB's search endpoint only
 * filters by a single year, so the rest happens over the pages loaded so far.
 * "relevance" keeps the order the server returned.
 */
export function filterAndSortMovies(
	movies: MovieResultItem[],
	filters: SearchFilters,
) {
	const { from, to } = normalizeYearRange(filters.from, filters.to);

	const filtered = movies.filter((movie) => {
		if (filters.genre && !movie.genre_ids?.includes(filters.genre)) {
			return false;
		}
		if (from || to) {
			const year = releaseYear(movie.release_date);
			if (!year || (from && year < from) || (to && year > to)) return false;
		}
		if (
			filters.rating &&
			(movie.vote_count < MIN_RATING_VOTES ||
				movie.vote_average < filters.rating)
		) {
			return false;
		}
		return true;
	});

	switch (filters.sort) {
		case "popularity":
			return filtered.sort((a, b) => b.popularity - a.popularity);
		case "rating":
			return filtered.sort(compareRating);
		case "newest":
			return filtered.sort((a, b) =>
				!a.release_date || !b.release_date
					? compareRelease(a, b)
					: -compareRelease(a, b),
			);
		case "oldest":
			return filtered.sort(compareRelease);
		case "title":
			return filtered.sort((a, b) => a.title.localeCompare(b.title));
		default:
			return filtered;
	}
}
