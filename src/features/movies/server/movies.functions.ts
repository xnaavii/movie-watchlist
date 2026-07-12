import type {
	MovieCreditsParams,
	MovieDetails,
	MovieDetailsParams,
	MovieListParams,
	MovieVideosParams,
	SearchMoviesParams,
} from "@lorenzopant/tmdb";
import { TMDBError } from "@lorenzopant/tmdb";
import { createServerFn } from "@tanstack/react-start";
import { tmdb } from "#/lib/tmdb";
import { watchmode } from "#/lib/watchmode";
import type { TMDBMovieList } from "../types";

const OMDB_API_KEY = process.env.OMDB_API_KEY;

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
		return tmdb.movies.credits({ ...data });
	});

export const getMovieVideos = createServerFn({ method: "GET" })
	.validator((data: MovieVideosParams) => data)
	.handler(async ({ data }) => {
		return tmdb.movies.videos({ ...data });
	});

export const searchMovies = createServerFn({ method: "GET" })
	.validator((data: SearchMoviesParams) => data)
	.handler(async ({ data }) => {
		return tmdb.search.movies({ ...data });
	});

export const getStreamingSources = createServerFn({ method: "GET" })
	.validator((data: { imdbId: string }) => data)
	.handler(async ({ data }) => {
		if (!process.env.WATCHMODE_API_KEY) {
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
