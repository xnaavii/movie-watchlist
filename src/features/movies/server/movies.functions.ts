import { env } from "cloudflare:workers";
import type {
	DiscoverMovieParams,
	MovieCreditsParams,
	MovieDetails,
	MovieDetailsParams,
	MovieImagesParams,
	MovieListParams,
	MovieRecommendationsParams,
	MovieResultItem,
	MovieReviewsParams,
	MovieVideosParams,
	PaginatedResponse,
	TrendingParams,
	WithLanguage,
} from "@lorenzopant/tmdb";
import { TMDBError } from "@lorenzopant/tmdb";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { imdbRating, streamingSource } from "#/db/schema";
import { tmdb } from "#/lib/tmdb";
import { watchmode } from "#/lib/watchmode";
import type {
	OmdbResponse,
	ResolvedSearch,
	SearchPerson,
	SmartSearchParams,
	SmartSearchResponse,
	TMDBMovieList,
} from "../types";
import {
	buildFallbackQueries,
	isPersonMatch,
	parseSearchQuery,
	rankFuzzyResults,
	rankSearchResults,
} from "../utils/search";

const OMDB_API_KEY = env.OMDB_API_KEY;
const IMDB_RATING_TTL_MS = 24 * 60 * 60 * 1000;
const STREAMING_SOURCE_TTL_MS = 24 * 60 * 60 * 1000;
const PERSON_MOVIE_LIMIT = 20;

export const getMovieDetails = createServerFn({ method: "GET" })
	.validator((data: MovieDetailsParams) => data)
	.handler(async ({ data }) => {
		try {
			const movie: MovieDetails = await tmdb.movies.details({ ...data });
			return movie;
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get the movie details",
			);
		}
	});

export const getMovieList = createServerFn({ method: "GET" })
	.validator(
		(
			data: {
				list: TMDBMovieList;
			} & MovieListParams,
		) => data,
	)
	.handler(async ({ data }) => {
		const { list, ...params } = data;

		try {
			switch (list) {
				case "popular":
					return await tmdb.movie_lists.popular(params);
				case "now_playing":
					return await tmdb.movie_lists.now_playing(params);
				case "upcoming":
					return await tmdb.movie_lists.upcoming(params);
				case "top_rated":
					return await tmdb.movie_lists.top_rated(params);
				default:
					list satisfies never;
					throw new Error(`Unknown movie list type: ${list}`);
			}
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get the movie list",
			);
		}
	});

export const getMovieRecommendations = createServerFn({ method: "GET" })
	.validator((data: MovieRecommendationsParams) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.movies.recommendations({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get movie recommendations",
			);
		}
	});

export const getMovieReviews = createServerFn({ method: "GET" })
	.validator((data: MovieReviewsParams) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.movies.reviews({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get movie reviews",
			);
		}
	});

export const getMovieCredits = createServerFn({ method: "GET" })
	.validator((data: MovieCreditsParams) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.movies.credits({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get the movie credits",
			);
		}
	});

export const getMovieVideos = createServerFn({ method: "GET" })
	.validator((data: MovieVideosParams) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.movies.videos({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get the movie videos",
			);
		}
	});

export const getMovieGenres = createServerFn({ method: "GET" })
	.validator((data: WithLanguage) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.genres.movie_list({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get movie genres",
			);
		}
	});

export const getLanguages = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			return await tmdb.configuration.languages();
		} catch (error) {
			throw new Error(
				error instanceof TMDBError ? error.message : "Failed to get languages",
			);
		}
	},
);

export const searchMovies = createServerFn({ method: "GET" })
	.validator((data: SmartSearchParams) => data)
	.handler(async ({ data }): Promise<SmartSearchResponse> => {
		try {
			const page = data.page ?? 1;

			if (data.resolved && page > 1) {
				const response = await tmdb.search.movies({
					query: data.resolved.query,
					year: data.resolved.year,
					page,
				});
				return {
					...response,
					results: rankResults(data.query, response.results, data.resolved),
					resolved: data.resolved,
					person: null,
				};
			}

			const [movies, person] = await Promise.all([
				findMovies(data.query),
				findPerson(data.query),
			]);
			return { ...movies, person };
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get search results",
			);
		}
	});

function rankResults(
	query: string,
	results: MovieResultItem[],
	resolved: ResolvedSearch,
) {
	return resolved.fuzzy
		? rankFuzzyResults(query, results)
		: rankSearchResults(parseSearchQuery(query).title, results);
}

/**
 * Tries the query as typed (with any trailing year used as a filter), then
 * without the year filter, then looser spellings, and returns the first that
 * finds something.
 */
async function findMovies(query: string) {
	const { title, year } = parseSearchQuery(query);
	const attempts: ResolvedSearch[] = [
		{ query: title, year, fuzzy: false },
		...(year ? [{ query, fuzzy: false }] : []),
		...buildFallbackQueries(title).map((fallback) => ({
			query: fallback,
			fuzzy: true,
		})),
	];

	let response: PaginatedResponse<MovieResultItem> | undefined;
	for (const resolved of attempts) {
		response = await tmdb.search.movies({
			query: resolved.query,
			year: resolved.year,
		});
		if (response.results.length > 0) {
			return {
				...response,
				results: rankResults(query, response.results, resolved),
				resolved,
			};
		}
	}

	return {
		page: 1,
		total_pages: 0,
		total_results: 0,
		...response,
		results: [],
		resolved: attempts[0],
	};
}

/** When the query names an actor or director, returns their best-known movies. */
async function findPerson(query: string): Promise<SearchPerson | null> {
	try {
		const { results } = await tmdb.search.person({ query });
		const person = results[0];
		if (!person || !isPersonMatch(query, person)) return null;

		const credits = await tmdb.people.movie_credits({ person_id: person.id });
		const movies =
			person.known_for_department === "Acting"
				? credits.cast
				: credits.crew.filter(
						(credit) => credit.department === person.known_for_department,
					);

		const unique = new Map<number, MovieResultItem>();
		for (const movie of movies) {
			if (movie.poster_path && !unique.has(movie.id)) {
				unique.set(movie.id, movie);
			}
		}

		const knownFor = [...unique.values()]
			.sort((a, b) => b.vote_count - a.vote_count)
			.slice(0, PERSON_MOVIE_LIMIT);
		if (knownFor.length === 0) return null;

		return { id: person.id, name: person.name, movies: knownFor };
	} catch {
		return null;
	}
}

export const getTrendingMovies = createServerFn({ method: "GET" })
	.validator((data: TrendingParams) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.trending.movies({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get trending movies",
			);
		}
	});

export const discoverMovies = createServerFn({ method: "GET" })
	.validator((data: DiscoverMovieParams) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.discover.movie({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError ? error.message : "Failed to get results",
			);
		}
	});

export const getMovieImages = createServerFn({ method: "GET" })
	.validator((data: MovieImagesParams) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.movies.images({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get movie images",
			);
		}
	});

export const getMovieWatchProviders = createServerFn({ method: "GET" })
	.validator((data: { movie_id: number }) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.movies.watch_providers({ movie_id: data.movie_id });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get where to watch the movie",
			);
		}
	});

export const getStreamingSources = createServerFn({ method: "GET" })
	.validator((data: { imdbId: string }) => data)
	.handler(async ({ data }) => {
		if (!data.imdbId) {
			throw new Error("Please provide imdb id");
		}

		const cached = await db.query.streamingSource.findFirst({
			where: eq(streamingSource.imdbId, data.imdbId),
		});

		const isFresh =
			cached &&
			Date.now() - cached.fetchedAt.getTime() < STREAMING_SOURCE_TTL_MS;

		if (isFresh) {
			return cached.sources;
		}

		if (!env.WATCHMODE_API_KEY) {
			throw new Error("Please provide WATCHMODE_API_KEY");
		}

		const { data: sources, error } = await watchmode.title.getSources(
			data.imdbId,
		);

		if (error) {
			if (cached) return cached.sources;
			throw new Error("Failed to fetch streaming sources");
		}

		await db
			.insert(streamingSource)
			.values({ imdbId: data.imdbId, sources, fetchedAt: new Date() })
			.onConflictDoUpdate({
				target: streamingSource.imdbId,
				set: { sources, fetchedAt: new Date() },
			});

		return sources;
	});

export const getImdbRating = createServerFn({ method: "GET" })
	.validator((data: { imdbId: string }) => data)
	.handler(async ({ data }) => {
		if (!data.imdbId) {
			throw new Error("Please provide imdb id");
		}

		const cached = await db.query.imdbRating.findFirst({
			where: eq(imdbRating.imdbId, data.imdbId),
		});

		const isFresh =
			cached && Date.now() - cached.fetchedAt.getTime() < IMDB_RATING_TTL_MS;

		if (isFresh) {
			return {
				imdbRating: cached.imdbRating,
				imdbVotes: cached.imdbVotes,
			};
		}

		if (!OMDB_API_KEY) {
			throw new Error("Please provide OMDB_API_KEY");
		}

		const response = await fetch(
			`https://www.omdbapi.com/?i=${data.imdbId}&apikey=${OMDB_API_KEY}`,
		);

		const result: OmdbResponse = await response.json();

		if (result.Response === "False") {
			if (cached) {
				return {
					imdbRating: cached.imdbRating,
					imdbVotes: cached.imdbVotes,
				};
			}
			throw new Error(result.Error ?? "OMDb returned no result");
		}

		await db
			.insert(imdbRating)
			.values({
				imdbId: data.imdbId,
				imdbRating: result.imdbRating,
				imdbVotes: result.imdbVotes,
				fetchedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: imdbRating.imdbId,
				set: {
					imdbRating: result.imdbRating,
					imdbVotes: result.imdbVotes,
					fetchedAt: new Date(),
				},
			});

		return {
			imdbRating: result.imdbRating,
			imdbVotes: result.imdbVotes,
		};
	});
