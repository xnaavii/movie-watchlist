import type { TMDBMovieList, TmdbMovie } from "../types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type TmdbPaginatedResponse<T> = {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
};

export async function fetchMovieDetails(id: number): Promise<TmdbMovie> {
	if (!Number.isFinite(id) || id <= 0) {
		throw new Error("Please provide a valid id");
	}

	const response = await fetch(`${TMDB_BASE_URL}/movie/${id}`, {
		headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
	});

	if (!response.ok) {
		const body = await response.text().catch(() => "");
		throw new Error(`TMDB API error: ${response.status} ${body}`);
	}

	return response.json();
}

export async function fetchMovieList(
	list: TMDBMovieList,
	language: string = "en-US",
	page: number = 1,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
	const url = `${TMDB_BASE_URL}/movie/${list}?language=${language}&page=${page}`;
	const response = await fetch(url, {
		headers: {
			accept: "application/json",
			Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
		},
	});

	if (!response.ok) {
		const body = await response.text().catch(() => "");
		throw new Error(
			`TMDB API error fetching list "${list}": ${response.status} ${body}`,
		);
	}

	return response.json();
}

export async function fetchMoviesByQuery(
	query: string,
	page: number = 1,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
	if (!query.trim()) {
		throw new Error("Please provide a search query");
	}

	const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`;
	const response = await fetch(url, {
		headers: {
			accept: "application/json",
			Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
		},
	});

	if (!response.ok) {
		const body = await response.text().catch(() => "");
		throw new Error(
			`TMDB API error searching "${query}": ${response.status} ${body}`,
		);
	}

	return response.json();
}
