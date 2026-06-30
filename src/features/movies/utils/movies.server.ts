import type { TmdbMovie } from "../types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function getMovieById(id: number) {
	if (id === undefined || id === null || id < 0) {
		return { success: false, message: "Please provide a valid id" };
	}

	try {
		const response = await fetch(`${TMDB_BASE_URL}/movie/${id}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new Error(
				`TMDB API ERROR: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		console.error("Error fetching movie: ", error);
	}
}

export async function getMoviesByPopularity(
	language: string = "en-US",
	page: number = 1,
) {
	try {
		const url = `${TMDB_BASE_URL}/movie/popular?language=${language}&page=${page}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new Error(
				`TMDB API ERROR: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		console.error("Error fetching popular movies: ", error);

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}
