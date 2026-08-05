import type {
	DiscoverMovieParams,
	LanguageISO6391,
	MovieImages,
	MovieResultItem,
} from "@lorenzopant/tmdb";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Movie } from "../watchlist/server/watchlist.server";

type DiscoverFilters = {
	genreId?: number;
	year?: number;
	sortBy?: DiscoverMovieParams["sort_by"];
	minRating?: number;
	language?: LanguageISO6391;
};

export function buildDiscoverParams(
	filters: DiscoverFilters,
): DiscoverMovieParams {
	const hasAnyFilter =
		filters.genreId || filters.year || filters.minRating || filters.language;

	return {
		with_genres: filters.genreId,
		primary_release_year: filters.year,
		sort_by: filters.sortBy ?? (hasAnyFilter ? undefined : "popularity.desc"),
		"vote_average.gte": filters.minRating,
		"vote_count.gte":
			filters.sortBy === "vote_average.desc"
				? 200
				: filters.sortBy === "primary_release_date.desc"
					? 20
					: undefined,
		with_original_language: filters.language,
	};
}

export function formatReleaseYear(
	releaseDate: string | null | undefined,
): string {
	if (!releaseDate || releaseDate.length < 4) return "N/A";
	return releaseDate.slice(0, 4);
}

export function normalizeMovie(movie: MovieResultItem): Movie {
	return {
		id: movie.id,
		title: movie.title,
		posterPath: movie.poster_path,
		backdropPath: movie.backdrop_path,
		releaseDate: movie.release_date,
	};
}

export function buildLogoMap(
	movies: { id: number }[],
	imageResults: UseQueryResult<MovieImages>[],
): Record<number, string | undefined> {
	return Object.fromEntries(
		movies.map((movie, i) => {
			const logo = imageResults[i]?.data?.logos[0];
			return [
				movie.id,
				logo
					? `https://image.tmdb.org/t/p/original${logo.file_path}`
					: undefined,
			];
		}),
	);
}
