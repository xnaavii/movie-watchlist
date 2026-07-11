import type { MovieDetailsParams, MovieListParams } from "@lorenzopant/tmdb";
import { queryOptions } from "@tanstack/react-query";
import { getMovieDetails, getMovieList } from "./server/movies.functions";
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
};
