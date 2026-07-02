const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original/";

export const getMovieImage = (tdmbImagePath: string) => {
	return `${IMAGE_BASE_URL}${tdmbImagePath}`;
};
