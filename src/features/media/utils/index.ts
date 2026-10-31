import type {
	DiscoverMovieParams,
	LanguageISO6391,
	MovieDetails,
	MovieImages,
	MovieResultItem,
	Review,
	TVSeriesDetails,
	TVSeriesResultItem,
} from "@lorenzopant/tmdb";
import type {
	MediaDetails,
	MediaItem,
	MediaRef,
	MediaReview,
	MediaType,
} from "../types";
import { resizeTmdbImage } from "./tmdb";

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

/**
 * Whether a title is out yet: a movie that has premiered or a show whose first
 * episode has aired. Without a date, only a movie TMDB marks as released counts.
 */
export function isReleased(
	media: Pick<MediaDetails, "mediaType" | "releaseDate" | "status">,
	today: Date = new Date(),
): boolean {
	if (media.releaseDate) {
		return media.releaseDate <= today.toISOString().slice(0, 10);
	}
	return media.mediaType === "movie" && media.status === "Released";
}

/** "movie:550", a key that stays unique across movies and TV shows. */
export const mediaKey = ({ mediaType, id }: MediaRef): string =>
	`${mediaType}:${id}`;

/** Alternates two lists, so movies and TV shows share a row evenly. */
/**
 * Every title across infinite query pages, once each. TMDB pages can overlap
 * as rankings shift, so later repeats are dropped.
 */
export function uniqueMedia<T extends MediaRef>(
	pages: { results: T[] }[] | undefined,
): T[] {
	const byKey = new Map<string, T>();
	for (const page of pages ?? []) {
		for (const item of page.results) {
			if (!byKey.has(mediaKey(item))) byKey.set(mediaKey(item), item);
		}
	}
	return [...byKey.values()];
}

export function interleave<T>(a: T[], b: T[]): T[] {
	const merged: T[] = [];
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		if (i < a.length) merged.push(a[i]);
		if (i < b.length) merged.push(b[i]);
	}
	return merged;
}

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
	movie: "Movie",
	tv: "TV show",
};

export function normalizeMovie(movie: MovieResultItem): MediaItem {
	return {
		id: movie.id,
		mediaType: "movie",
		title: movie.title,
		originalTitle: movie.original_title,
		posterPath: movie.poster_path,
		backdropPath: movie.backdrop_path,
		releaseDate: movie.release_date,
		overview: movie.overview,
		genreIds: movie.genre_ids,
		voteAverage: movie.vote_average,
		voteCount: movie.vote_count,
		popularity: movie.popularity,
		originalLanguage: movie.original_language,
	};
}

export function normalizeTVShow(show: TVSeriesResultItem): MediaItem {
	return {
		id: show.id,
		mediaType: "tv",
		title: show.name,
		originalTitle: show.original_name,
		posterPath: show.poster_path,
		backdropPath: show.backdrop_path,
		releaseDate: show.first_air_date,
		overview: show.overview,
		genreIds: show.genre_ids,
		voteAverage: show.vote_average,
		voteCount: show.vote_count,
		popularity: show.popularity,
		originalLanguage: show.original_language,
	};
}

export function normalizeMovieDetails(movie: MovieDetails): MediaDetails {
	return {
		id: movie.id,
		mediaType: "movie",
		title: movie.title,
		originalTitle: movie.original_title,
		posterPath: movie.poster_path,
		backdropPath: movie.backdrop_path,
		releaseDate: movie.release_date,
		overview: movie.overview,
		genreIds: movie.genres.map((genre) => genre.id),
		voteAverage: movie.vote_average,
		voteCount: movie.vote_count,
		popularity: movie.popularity,
		originalLanguage: movie.original_language,
		genres: movie.genres,
		tagline: movie.tagline,
		imdbId: movie.imdb_id,
		status: movie.status,
		runtime: movie.runtime,
		budget: movie.budget,
		revenue: movie.revenue,
	};
}

export function normalizeTVDetails(
	show: TVSeriesDetails,
	imdbId?: string,
): MediaDetails {
	return {
		id: show.id,
		mediaType: "tv",
		title: show.name,
		originalTitle: show.original_name,
		posterPath: show.poster_path,
		backdropPath: show.backdrop_path,
		releaseDate: show.first_air_date,
		overview: show.overview,
		genreIds: show.genres.map((genre) => genre.id),
		voteAverage: show.vote_average,
		voteCount: show.vote_count,
		popularity: show.popularity,
		originalLanguage: show.original_language,
		genres: show.genres,
		tagline: show.tagline,
		imdbId: imdbId || undefined,
		status: show.status,
		runtime: episodeRuntime(show),
		lastAirDate: show.last_air_date,
		numberOfSeasons: show.number_of_seasons,
		numberOfEpisodes: show.number_of_episodes,
		networks: show.networks?.map((network) => network.name),
		createdBy: show.created_by.map(({ id, name }) => ({ id, name })),
		seasons: show.seasons
			// Season 0 holds specials, which don't count as a season.
			?.filter((season) => season.season_number > 0)
			.map((season) => ({
				id: season.id,
				seasonNumber: season.season_number,
				name: season.name,
				episodeCount: season.episode_count,
				airDate: season.air_date,
				posterPath: season.poster_path,
				voteAverage: season.vote_average,
			})),
		nextEpisode: show.next_episode_to_air && {
			name: show.next_episode_to_air.name,
			seasonNumber: show.next_episode_to_air.season_number,
			episodeNumber: show.next_episode_to_air.episode_number,
			airDate: show.next_episode_to_air.air_date,
		},
	};
}

/** TMDB often leaves episode_run_time empty, so the latest episode fills in. */
function episodeRuntime(show: TVSeriesDetails): number | undefined {
	return (
		show.episode_run_time.find((minutes) => minutes > 0) ??
		show.last_episode_to_air?.runtime ??
		undefined
	);
}

/**
 * Minutes it takes to watch a title start to finish: the movie's length, or
 * every episode of a TV show.
 */
export function totalRuntime(details: MediaDetails): number {
	if (details.mediaType === "movie") return details.runtime ?? 0;
	return (details.runtime ?? 0) * (details.numberOfEpisodes ?? 0);
}

export function normalizeReview(review: Review): MediaReview {
	return {
		id: review.id,
		authorName: review.author_details.name || review.author,
		avatarSrc: resizeTmdbImage(review.author_details.avatar_path, "w185"),
		createdAt: review.created_at,
		content: review.content,
		url: review.url,
	};
}

/** The full-size URL of a title's first logo, if TMDB has one. */
export function toLogoUrl(images: Pick<MovieImages, "logos">) {
	const logo = images.logos[0];
	return logo
		? `https://image.tmdb.org/t/p/original${logo.file_path}`
		: undefined;
}
