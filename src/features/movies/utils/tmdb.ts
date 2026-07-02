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
