import type { Genre, PaginatedResponse } from "@lorenzopant/tmdb";

export const MEDIA_TYPES = ["movie", "tv"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

/** Points at one TMDB title. Movie and TV ids overlap, so both parts are needed. */
export type MediaRef = { mediaType: MediaType; id: number };

/** A movie or TV show as lists, rows and cards show it. */
export type MediaItem = MediaRef & {
	title: string;
	originalTitle?: string;
	posterPath?: string | null;
	backdropPath?: string | null;
	/** Release date for movies, first air date for TV shows (YYYY-MM-DD). */
	releaseDate?: string | null;
	overview?: string;
	genreIds?: number[];
	voteAverage?: number;
	voteCount?: number;
	popularity?: number;
	originalLanguage?: string;
};

export type MediaPage = PaginatedResponse<MediaItem>;

export type MediaPerson = { id: number; name: string };

/** A movie or TV show as its details page shows it. */
export type MediaDetails = MediaItem & {
	genres: Genre[];
	tagline?: string;
	imdbId?: string;
	status?: string;
	/** Movie length, or a typical episode for TV shows, in minutes. */
	runtime?: number;
	budget?: number;
	revenue?: number;
	lastAirDate?: string;
	numberOfSeasons?: number;
	numberOfEpisodes?: number;
	networks?: string[];
	createdBy?: MediaPerson[];
	seasons?: MediaSeason[];
	nextEpisode?: MediaEpisode;
};

export type MediaSeason = {
	id: number;
	seasonNumber: number;
	name: string;
	episodeCount: number;
	airDate?: string;
	posterPath?: string;
	voteAverage?: number;
};

export type MediaEpisode = {
	name: string;
	seasonNumber: number;
	episodeNumber: number;
	airDate?: string;
};

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

export type TMDBMovieList =
	| "popular"
	| "now_playing"
	| "top_rated"
	| "upcoming";

export type TMDBTVList =
	| "popular"
	| "airing_today"
	| "on_the_air"
	| "top_rated";

export type MediaListRequest =
	| { mediaType: "movie"; list: TMDBMovieList }
	| { mediaType: "tv"; list: TMDBTVList };

export type OmdbResponse =
	| {
			Response: "True";
			imdbRating: string;
			imdbVotes: string;
			[key: string]: unknown;
	  }
	| { Response: "False"; Error: string };

export type MediaReview = {
	id: string;
	authorName: string;
	avatarSrc?: string;
	createdAt: string;
	content: string;
	url: string;
};

/** The query that actually produced search results, reused to fetch later pages. */
export type ResolvedSearch = {
	query: string;
	year?: string;
	/** True when the exact query found nothing and a looser spelling was used. */
	fuzzy: boolean;
};

export type SearchPerson = {
	id: number;
	name: string;
	/** Their best-known movies and TV shows. */
	credits: MediaItem[];
};

export type SmartSearchParams = {
	query: string;
	page?: number;
	resolved?: ResolvedSearch;
};

export type SmartSearchResponse = MediaPage & {
	resolved: ResolvedSearch;
	person: SearchPerson | null;
};
