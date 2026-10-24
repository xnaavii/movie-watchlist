import type { MovieResultItem, PaginatedResponse } from "@lorenzopant/tmdb";

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

export type OmdbResponse =
	| {
			Response: "True";
			imdbRating: string;
			imdbVotes: string;
			[key: string]: unknown;
	  }
	| { Response: "False"; Error: string };

export type MovieReview = {
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
	movies: MovieResultItem[];
};

export type SmartSearchParams = {
	query: string;
	page?: number;
	resolved?: ResolvedSearch;
};

export type SmartSearchResponse = PaginatedResponse<MovieResultItem> & {
	resolved: ResolvedSearch;
	person: SearchPerson | null;
};
