import { env } from "cloudflare:workers";
import type {
	DiscoverMovieParams,
	MovieCreditsParams,
	MovieDetails,
	MovieDetailsParams,
	MovieImagesParams,
	MovieListParams,
	MovieVideosParams,
	SearchMoviesParams,
	WithLanguage,
} from "@lorenzopant/tmdb";
import { TMDBError } from "@lorenzopant/tmdb";
import { createServerFn } from "@tanstack/react-start";
import { tmdb } from "#/lib/tmdb";
import { watchmode } from "#/lib/watchmode";
import type { TMDBMovieList } from "../types";

const OMDB_API_KEY = env.OMDB_API_KEY;

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
		if (!env.WATCHMODE_API_KEY) {
			throw new Error("Please provide WATCHMODE_API_KEY");
		}

		if (!data.imdbId) {
			throw new Error("Please provide imdb id");
		}

		const { data: sources, error } = await watchmode.title.getSources(
			data.imdbId,
		);

		if (error) {
			throw new Error("Failed to fetch streaming sources");
		}

		return sources;
	});

export const getImdbRating = createServerFn({ method: "GET" })
	.validator((data: { imdbId: string }) => data)
	.handler(async ({ data }) => {
		if (!OMDB_API_KEY) {
			throw new Error("Please provide OMDB_API_KEY");
		}

		if (!data.imdbId) {
			throw new Error("Please provide imdb id");
		}

		const response = await fetch(
			`https://www.omdbapi.com/?i=${data.imdbId}&apikey=${OMDB_API_KEY}`,
		);

		const result = await response.json();

		if (result.Response === "False") {
			throw new Error(result.Error ?? "OMDb returned no result");
		}

		return {
			imdbRating: result.imdbRating,
			imdbVotes: result.imdbVotes,
		};
	});
