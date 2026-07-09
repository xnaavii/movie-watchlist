import { createServerFn } from "@tanstack/react-start";
import type { TMDBMovieList } from "../types";
import {
	fetchMovieDetails,
	fetchMovieList,
	fetchMoviesByQuery,
} from "./movies.server";

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
