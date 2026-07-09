import { queryOptions } from "@tanstack/react-query";
import {
	fetchMovieDetailsFn,
	fetchMovieListFn,
} from "./server/movies.functions";
import type { TMDBMovieList } from "./types";

export const movieQueries = {
	list: (list: TMDBMovieList, language?: string, page?: number) =>
		queryOptions({
			queryKey: ["movies", { list, language, page }],
			queryFn: () => fetchMovieListFn({ data: { list, language, page } }),
		}),
	details: (id: number) =>
		queryOptions({
			queryKey: ["movies", "details", { id }],
			queryFn: () => fetchMovieDetailsFn({ data: { id } }),
		}),
};
