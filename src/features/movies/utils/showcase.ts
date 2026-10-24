import type { Genre, ImageItem, MovieResultItem } from "@lorenzopant/tmdb";
import { formatReleaseYear } from "../utils";
import { toTmdbImageUrl } from "./tmdb";

export const SHOWCASE_LIMIT = 8;

export interface ShowcaseMovie {
	id: number;
	title: string;
	year: string;
	genres: string[];
	rating: number | null;
	backdrop: string;
	logo: string | null;
}

/** Prefers PNG logos, which render more reliably than SVG on dark photos. */
export function pickLogo(logos: ImageItem[] | undefined): string | null {
	if (!logos?.length) return null;
	const logo =
		logos.find((item) => item.file_path.endsWith(".png")) ?? logos[0];
	return toTmdbImageUrl(logo.file_path, "w500") ?? null;
}

/** Keeps the first trending movies that have a backdrop to show. */
export function selectShowcaseCandidates(
	movies: MovieResultItem[],
	limit = SHOWCASE_LIMIT,
): MovieResultItem[] {
	return movies.filter((movie) => movie.backdrop_path).slice(0, limit);
}

export function toShowcaseMovie(
	movie: MovieResultItem,
	genres: Genre[],
	logo: string | null,
): ShowcaseMovie | null {
	const backdrop = toTmdbImageUrl(movie.backdrop_path, "w1280");
	if (!backdrop) return null;

	const genreNames = movie.genre_ids
		.map((id) => genres.find((genre) => genre.id === id)?.name)
		.filter((name): name is string => Boolean(name))
		.slice(0, 3);

	return {
		id: movie.id,
		title: movie.title,
		year: formatReleaseYear(movie.release_date),
		genres: genreNames,
		rating:
			movie.vote_count > 0 ? Math.round(movie.vote_average * 10) / 10 : null,
		backdrop,
		logo,
	};
}
