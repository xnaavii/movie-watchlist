import type {
	MovieDetails,
	MovieDetailsParams,
	MovieListParams,
} from "@lorenzopant/tmdb";
import { createServerFn } from "@tanstack/react-start";
import { tmdb } from "#/lib/tmdb";
import type { TMDBMovieList } from "../types";
import {
	fetchMovieDetails,
	fetchMovieList,
	fetchMoviesByQuery,
} from "./movies.server";

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

export const getTopRatedMovies = createServerFn({ method: "GET" })
	.validator((data: MovieListParams) => data)
	.handler(async ({ data }) => {
		return tmdb.movie_lists.top_rated({ ...data });
	});

export const getNowPlayingMovies = createServerFn({ method: "GET" })
	.validator((data: MovieListParams) => data)
	.handler(async ({ data }) => {
		return tmdb.movie_lists.now_playing({ ...data });
	});

export const getUpcomingMovies = createServerFn({ method: "GET" })
	.validator((data: MovieListParams) => data)
	.handler(async ({ data }) => {
		return tmdb.movie_lists.upcoming({ ...data });
	});

export const fetchMovieDetailsFn = createServerFn({ method: "GET" })
	.validator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		return fetchMovieDetails(data.id);
	});

export const fetchMovieListFn = createServerFn({ method: "GET" })
	.validator(
		(data: { list: TMDBMovieList; language?: string; page?: number }) => data,
	)
	.handler(async ({ data }) => {
		return fetchMovieList(data?.list, data?.language, data?.page);
	});

export const fetchMoviesByQueryFn = createServerFn({ method: "GET" })
	.validator((data: { query: string; page?: number }) => data)
	.handler(async ({ data }) => {
		return fetchMoviesByQuery(data.query, data.page);
	});
