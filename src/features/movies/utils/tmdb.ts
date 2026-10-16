const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type TmdbImageSize =
	| "w92"
	| "w154"
	| "w185"
	| "w342"
	| "w500"
	| "w780"
	| "w1280"
	| "original";

export const getMovieImage = (
	tmdbImagePath: string | null,
	size: TmdbImageSize = "w780",
): string | null => {
	if (!tmdbImagePath) return null;
	return `${IMAGE_BASE_URL}/${size}${tmdbImagePath}`;
};

export const resizeTmdbImage = (
	imageUrl: string | undefined,
	size: TmdbImageSize,
): string | undefined => imageUrl?.replace("/t/p/original/", `/t/p/${size}/`);

export const getTmdbMovieReviewsUrl = (movieId: number): string =>
	`https://www.themoviedb.org/movie/${movieId}/reviews`;

/**
 * Builds an image URL from a TMDB path. Paths the TMDB client already
 * expanded into full URLs are resized instead.
 */
export const toTmdbImageUrl = (
	path: string | null | undefined,
	size: TmdbImageSize,
): string | undefined => {
	if (!path) return undefined;
	if (path.startsWith("http"))
		return path.replace(/\/t\/p\/[^/]+\//, `/t/p/${size}/`);
	return `${IMAGE_BASE_URL}/${size}${path}`;
};
