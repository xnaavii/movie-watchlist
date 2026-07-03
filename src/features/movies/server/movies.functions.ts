import { createServerFn } from "@tanstack/react-start";
import { getMovieById, getMoviesByList } from "./movies.server";

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
