export type TmdbResult<T> =
	| { success: true; data: { results: T[] } }
	| { success: false; error: string };

export type TmdbMovie = {
	id: number;
	title: string;
	poster_path: string;
};

export type TmdbGenre = {
	id: number;
	name: string;
};

export type TmdbMovieDetails = TmdbMovie & {
	genres: TmdbGenre[];
	runtime: number;
	tagline: string;
};

export type TmdbSingleResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };
