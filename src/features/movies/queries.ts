import { queryOptions } from "@tanstack/react-query";
import { getMovieListFn } from "./server/movies.functions";
import type { TMDBMovieList } from "./types";

export const movieQueries = {
	list: (list?: TMDBMovieList, language?: string, page?: number) =>
		queryOptions({
			queryKey: ["movies", { list, language, page }],
			queryFn: () => getMovieListFn({ data: { list, language, page } }),
		}),
	details: () => {},
};
