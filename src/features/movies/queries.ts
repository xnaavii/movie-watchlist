import { queryOptions } from "@tanstack/react-query";
import { getMoviesList } from "./server/movies.functions";
import type { TMDBMovieList } from "./types";

export const moviesListQuery = (
	list: TMDBMovieList,
	language: string,
	page: number,
) => {
	return queryOptions({
		queryKey: ["movies", list, language, page],
		queryFn: () => getMoviesList({ data: { list, language, page } }),
	});
};
