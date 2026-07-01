export type TmdbResult<T> =
	| { success: true; data: { results: T[] } }
	| { success: false; error: string };

export type TmdbMovie = {
	id: number;
	title: string;
	poster_path: string;
};
