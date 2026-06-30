import { createServerFn } from "@tanstack/react-start";
import { getMovieById, getMoviesByPopularity } from "./movies.server";

export const getMovie = createServerFn({ method: "GET" })
	.validator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		return getMovieById(data.id);
	});

export const getPopularMovies = createServerFn({ method: "GET" })
	.validator((data: { language?: string; page?: number }) => data)
	.handler(async ({ data }) => {
		const { language = "en-US", page = 1 } = data ?? {};
		return getMoviesByPopularity(language, page);
	});
