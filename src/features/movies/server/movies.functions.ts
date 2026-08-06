import { env } from "cloudflare:workers";
import type {
	DiscoverMovieParams,
	MovieCreditsParams,
	MovieDetails,
	MovieDetailsParams,
	MovieImagesParams,
	MovieListParams,
	MovieRecommendationsParams,
	MovieVideosParams,
	SearchMoviesParams,
	WithLanguage,
} from "@lorenzopant/tmdb";
import { TMDBError } from "@lorenzopant/tmdb";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { imdbRating, streamingSource } from "#/db/schema";
import { tmdb } from "#/lib/tmdb";
import { watchmode } from "#/lib/watchmode";
import type { OmdbResponse, TMDBMovieList } from "../types";

const OMDB_API_KEY = env.OMDB_API_KEY;
const IMDB_RATING_TTL_MS = 24 * 60 * 60 * 1000;
const STREAMING_SOURCE_TTL_MS = 24 * 60 * 60 * 1000;

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
	.validator((data: SearchMoviesParams) => data)
	.handler(async ({ data }) => {
		try {
			return await tmdb.search.movies({ ...data });
		} catch (error) {
			throw new Error(
				error instanceof TMDBError
					? error.message
					: "Failed to get search results",
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
