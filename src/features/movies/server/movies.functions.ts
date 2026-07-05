import { createServerFn } from "@tanstack/react-start";
import {
	getMovieById,
	getMoviesByList,
	searchMoviesByQuery,
} from "./movies.server";

export const getMovie = createServerFn({ method: "GET" })
	.validator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		return getMovieById(data.id);
	});

export const getMoviesList = createServerFn({ method: "GET" })
	.validator(
		(data?: {
			list?: "popular" | "now_playing" | "top_rated" | "upcoming";
			language?: string;
			page?: number;
		}) => data,
	)
	.handler(async ({ data }) => {
		return getMoviesByList(data?.list, data?.language, data?.page);
	});

export const searchMovies = createServerFn({ method: "GET" })
	.validator((data: { query: string; page?: number }) => data)
	.handler(async ({ data }) => {
		return searchMoviesByQuery(data.query, data.page);
	});
