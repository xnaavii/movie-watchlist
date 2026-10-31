import { joinPluralNouns } from "./mediaTypes";
import { MEDIA_TYPES, type MediaType } from "./types";
import { slugify } from "./utils/slug";

/**
 * A genre on the discover pages, covering movies and TV shows. TMDB keeps
 * separate genre lists for each, and TV merges some movie genres ("Action &
 * Adventure", "Sci-Fi & Fantasy"), so each entry lists the ids to use per type.
 * An empty list means the genre has no counterpart for that type.
 */
export interface DiscoverGenre {
	slug: string;
	name: string;
	ids: Record<MediaType, number[]>;
}

const genre = (name: string, movie: number[], tv: number[]): DiscoverGenre => ({
	slug: slugify(name),
	name,
	ids: { movie, tv },
});

// TMDB's genre ids have been stable for years, so they live here instead of
// being fetched on every discover page. TV's News and Talk are left out, as
// their discover results are mostly daily broadcasts.
export const DISCOVER_GENRES: DiscoverGenre[] = [
	genre("Action", [28], [10759]),
	genre("Adventure", [12], [10759]),
	genre("Animation", [16], [16]),
	genre("Comedy", [35], [35]),
	genre("Crime", [80], [80]),
	genre("Documentary", [99], [99]),
	genre("Drama", [18], [18]),
	genre("Family", [10751], [10751]),
	genre("Fantasy", [14], [10765]),
	genre("History", [36], []),
	genre("Horror", [27], []),
	genre("Kids", [], [10762]),
	genre("Music", [10402], []),
	genre("Mystery", [9648], [9648]),
	genre("Reality", [], [10764]),
	genre("Romance", [10749], []),
	genre("Science Fiction", [878], [10765]),
	genre("Soap", [], [10766]),
	genre("Thriller", [53], []),
	genre("TV Movie", [10770], []),
	genre("War", [10752], [10768]),
	genre("Western", [37], [37]),
];

/** Whether a genre has titles of the given type. */
export const hasMediaType = (genre: DiscoverGenre, mediaType: MediaType) =>
	genre.ids[mediaType].length > 0;

/** The genres to offer for one media type, or for both. */
export const listDiscoverGenres = (mediaType?: MediaType) =>
	mediaType
		? DISCOVER_GENRES.filter((genre) => hasMediaType(genre, mediaType))
		: DISCOVER_GENRES;

/**
 * Finds a genre by its slug. Legacy numeric URLs used movie genre ids, so a
 * number matches a movie id first and a TV id after that.
 */
export function findDiscoverGenre(slug: string): DiscoverGenre | undefined {
	const bySlug = DISCOVER_GENRES.find((genre) => genre.slug === slug);
	if (bySlug || !/^\d+$/.test(slug)) return bySlug;

	const id = Number(slug);
	return (
		DISCOVER_GENRES.find((genre) => genre.ids.movie.includes(id)) ??
		DISCOVER_GENRES.find((genre) => genre.ids.tv.includes(id))
	);
}

/**
 * The discover page for a TMDB genre from either list, e.g. TV's "Sci-Fi &
 * Fantasy" opens Fantasy. Undefined for genres without a page.
 */
export const findDiscoverGenreById = (id: number) =>
	findDiscoverGenre(String(id));

/** TMDB's `with_genres` value: ids joined with "|" match any of them. */
export const toWithGenres = (genre: DiscoverGenre, mediaType: MediaType) =>
	genre.ids[mediaType].join("|");

/** The types a genre has titles for, movies first. */
export const genreMediaTypes = (genre: DiscoverGenre) =>
	MEDIA_TYPES.filter((mediaType) => hasMediaType(genre, mediaType));

/** "movies and TV shows", "movies" or "TV shows", by what the genre has. */
export function genreMediaLabel(genre: DiscoverGenre) {
	return joinPluralNouns(genreMediaTypes(genre));
}

export function genreTagline(genre: DiscoverGenre) {
	return `Handpicked ${genre.name} ${genreMediaLabel(genre)} to add to your list`;
}
