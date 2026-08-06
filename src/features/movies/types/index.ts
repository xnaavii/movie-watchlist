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
