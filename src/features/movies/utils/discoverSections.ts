import type { DiscoverMovieParams } from "@lorenzopant/tmdb";

function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** Well reviewed movies that never got blockbuster attention. */
export const HIDDEN_GEMS_PARAMS: DiscoverMovieParams = {
	sort_by: "vote_average.desc",
	"vote_average.gte": 7.5,
	"vote_count.gte": 300,
	"vote_count.lte": 3000,
};

/** Acclaimed movies released before 1980. */
export const CLASSICS_PARAMS: DiscoverMovieParams = {
	sort_by: "vote_average.desc",
	"primary_release_date.lte": "1979-12-31",
	"vote_count.gte": 1000,
};

/** Well liked movies that fit into an evening. */
export const QUICK_WATCHES_PARAMS: DiscoverMovieParams = {
	sort_by: "popularity.desc",
	"with_runtime.gte": 60,
	"with_runtime.lte": 95,
	"vote_average.gte": 7,
	"vote_count.gte": 500,
};

/**
 * Theatrical releases from tomorrow onward. TMDB's own "upcoming" list also
 * includes movies that are already out, so it is built from discover instead.
 */
export function buildComingSoonParams(today: Date): DiscoverMovieParams {
	const tomorrow = new Date(today);
	tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

	return {
		sort_by: "popularity.desc",
		"primary_release_date.gte": toIsoDate(tomorrow),
		with_release_type: "2|3",
	};
}

/** Well liked movies released in the last three months. */
export function buildNewReleasesParams(today: Date): DiscoverMovieParams {
	const threeMonthsAgo = new Date(today);
	threeMonthsAgo.setUTCMonth(threeMonthsAgo.getUTCMonth() - 3);

	return {
		sort_by: "popularity.desc",
		"primary_release_date.gte": toIsoDate(threeMonthsAgo),
		"primary_release_date.lte": toIsoDate(today),
		"vote_count.gte": 50,
	};
}

/** The highest rated movies with enough votes to be trustworthy. */
export const TOP_RATED_PARAMS: DiscoverMovieParams = {
	sort_by: "vote_average.desc",
	"vote_count.gte": 1000,
};

/** Narrows any discover section down to a single genre. */
export function withGenre(
	params: DiscoverMovieParams,
	genreId: number,
): DiscoverMovieParams {
	return { ...params, with_genres: genreId };
}
