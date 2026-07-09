import { createServerFn } from "@tanstack/react-start";
import type { TMDBMovieList } from "../types";
import {
	getMovieById,
	getMovieList,
	searchMoviesByQuery,
} from "./movies.server";

export const getMovie = createServerFn({ method: "GET" })
	.validator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		return getMovieById(data.id);
	});

export const getMovieListFn = createServerFn({ method: "GET" })
	.validator(
		(data: { list?: TMDBMovieList; language?: string; page?: number }) => data,
	)
	.handler(async ({ data }) => {
		return getMovieList(data?.list, data?.language, data?.page);
	});

export const searchMovies = createServerFn({ method: "GET" })
	.validator((data: { query: string; page?: number }) => data)
	.handler(async ({ data }) => {
		return searchMoviesByQuery(data.query, data.page);
	});
