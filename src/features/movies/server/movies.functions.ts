import type {
	MovieDetails,
	MovieDetailsParams,
	MovieListParams,
	MovieVideosParams,
	SearchMoviesParams,
} from "@lorenzopant/tmdb";
import { createServerFn } from "@tanstack/react-start";
import { tmdb } from "#/lib/tmdb";
import type { TMDBMovieList } from "../types";

const OMDB_API_KEY = process.env.OMDB_API_KEY;

export const getMovieDetails = createServerFn({ method: "GET" })
	.validator((data: MovieDetailsParams) => data)
	.handler(async ({ data }) => {
		const movie: MovieDetails = await tmdb.movies.details({ ...data });

		return movie;
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

		switch (list) {
			case "popular":
				return tmdb.movie_lists.popular(params);
			case "now_playing":
				return tmdb.movie_lists.now_playing(params);
			case "upcoming":
				return tmdb.movie_lists.upcoming(params);
			case "top_rated":
				return tmdb.movie_lists.top_rated(params);
		}
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
