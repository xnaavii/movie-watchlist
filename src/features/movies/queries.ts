import type { MovieDetailsParams } from "@lorenzopant/tmdb";
import { queryOptions } from "@tanstack/react-query";
import { fetchMovieListFn, getMovieDetails } from "./server/movies.functions";
import type { TMDBMovieList } from "./types";

export const movieQueries = {
	list: (list: TMDBMovieList, language?: string, page?: number) =>
		queryOptions({
			queryKey: ["movies", { list, language, page }],
			queryFn: () => fetchMovieListFn({ data: { list, language, page } }),
		}),
	details: (params: MovieDetailsParams) =>
		queryOptions({
			queryKey: ["movies", "details", { id: params.movie_id }],
			queryFn: () => getMovieDetails({ data: { ...params } }),
		}),
};
