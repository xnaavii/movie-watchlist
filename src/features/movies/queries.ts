import type {
	MovieDetailsParams,
	MovieListParams,
	SearchMoviesParams,
} from "@lorenzopant/tmdb";
import { queryOptions } from "@tanstack/react-query";
import {
	getMovieDetails,
	getMovieList,
	searchMovies,
} from "./server/movies.functions";
import type { TMDBMovieList } from "./types";

export const movieQueries = {
	list: (list: TMDBMovieList, params?: MovieListParams) =>
		queryOptions({
			queryKey: ["movies", "list", { list, params }],
			queryFn: () => getMovieList({ data: { list, ...params } }),
		}),
	details: (params: MovieDetailsParams) =>
		queryOptions({
			queryKey: ["movies", "details", { id: params.movie_id }],
			queryFn: () => getMovieDetails({ data: { ...params } }),
		}),
	search: (params: SearchMoviesParams) =>
		queryOptions({
			queryKey: ["movies", "search", { ...params }],
			queryFn: () => searchMovies({ data: { ...params } }),
		}),
};
