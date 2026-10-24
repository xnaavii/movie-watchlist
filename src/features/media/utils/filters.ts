import { z } from "zod";
import { MEDIA_TYPES, type MediaItem } from "../types";

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
export const mediaFilterSearchSchema = z.object({
	genre: optionalInt,
	from: optionalInt,
	to: optionalInt,
});

export const searchFilterSearchSchema = mediaFilterSearchSchema.extend({
	type: z.enum(MEDIA_TYPES).optional().catch(undefined),
	rating: z.coerce.number().min(1).max(9).optional().catch(undefined),
	sort: z.enum(SEARCH_SORTS).optional().catch(undefined),
});
export type SearchFilters = z.infer<typeof searchFilterSearchSchema>;

export const watchlistFilterSearchSchema = mediaFilterSearchSchema.extend({
	type: z.enum(MEDIA_TYPES).optional().catch(undefined),
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

function compareRating(a: MediaItem, b: MediaItem) {
	const aVotes = a.voteCount ?? 0;
	const bVotes = b.voteCount ?? 0;
	const aRated = aVotes >= MIN_RATING_VOTES;
	const bRated = bVotes >= MIN_RATING_VOTES;
	if (aRated !== bRated) return aRated ? -1 : 1;
	return (b.voteAverage ?? 0) - (a.voteAverage ?? 0) || bVotes - aVotes;
}

function compareRelease(a: MediaItem, b: MediaItem) {
	// Undated titles sort last whichever direction is picked.
	if (!a.releaseDate || !b.releaseDate) {
		return Number(!a.releaseDate) - Number(!b.releaseDate);
	}
	return a.releaseDate.localeCompare(b.releaseDate);
}

/**
 * Filters and sorts TMDB results on the client. TMDB's search endpoint only
 * filters by a single year, so the rest happens over the pages loaded so far.
 * "relevance" keeps the order the server returned.
 */
export function filterAndSortMedia(items: MediaItem[], filters: SearchFilters) {
	const { from, to } = normalizeYearRange(filters.from, filters.to);

	const filtered = items.filter((item) => {
		if (filters.type && item.mediaType !== filters.type) return false;
		if (filters.genre && !item.genreIds?.includes(filters.genre)) {
			return false;
		}
		if (from || to) {
			const year = releaseYear(item.releaseDate);
			if (!year || (from && year < from) || (to && year > to)) return false;
		}
		if (
			filters.rating &&
			((item.voteCount ?? 0) < MIN_RATING_VOTES ||
				(item.voteAverage ?? 0) < filters.rating)
		) {
			return false;
		}
		return true;
	});

	switch (filters.sort) {
		case "popularity":
			return filtered.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
		case "rating":
			return filtered.sort(compareRating);
		case "newest":
			return filtered.sort((a, b) =>
				!a.releaseDate || !b.releaseDate
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
