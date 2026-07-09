export type TmdbResult<T> =
	| { success: true; data: { results: T[] } }
	| { success: false; error: string };

export type TmdbGenre = {
	id: number;
	name: string;
};

export type TmdbMovie = {
	id: number;
	title: string;
	poster_path: string;
	genres: TmdbGenre[];
	backdrop_path: string;
	runtime: number;
	tagline: string;
	overview: string;
	vote_average: number;
};
export type TmdbSingleResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

export type TMDBMovieList =
	| "popular"
	| "now_playing"
	| "top_rated"
	| "upcoming";
