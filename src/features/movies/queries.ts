import type {
	DiscoverMovieParams,
	MovieCreditsParams,
	MovieDetailsParams,
	MovieListParams,
	MovieVideosParams,
	SearchMoviesParams,
	WithLanguage,
} from "@lorenzopant/tmdb";
import { queryOptions } from "@tanstack/react-query";
import {
	discoverMovies,
	getImdbRating,
	getMovieCredits,
	getMovieDetails,
	getMovieGenres,
	getMovieList,
	getMovieVideos,
	getStreamingSources,
	searchMovies,
} from "./server/movies.functions";
import type { TMDBMovieList } from "./types";

export const movieQueries = {
	list: (list: TMDBMovieList, params?: MovieListParams) =>
		queryOptions({
			queryKey: ["movies", "list", { list, params }],
			queryFn: () => getMovieList({ data: { list, ...params } }),
		}),
	details: (params: MovieDetailsParams) =>
		queryOptions({
			queryKey: ["movies", "details", { id: params.movie_id }],
			queryFn: () => getMovieDetails({ data: { ...params } }),
		}),
	videos: (params: MovieVideosParams) =>
		queryOptions({
			queryKey: ["movies", "details", "videos", { ...params }],
			queryFn: () => getMovieVideos({ data: { ...params } }),
		}),
	credits: (params: MovieCreditsParams) =>
		queryOptions({
			queryKey: ["movies", "details", "credits", { ...params }],
			queryFn: () => getMovieCredits({ data: { ...params } }),
		}),
	search: (params: SearchMoviesParams) =>
		queryOptions({
			queryKey: ["movies", "search", { ...params }],
			queryFn: () => searchMovies({ data: { ...params } }),
		}),
	discover: (params: DiscoverMovieParams) =>
		queryOptions({
			queryKey: ["movies", "discover", { ...params }],
			queryFn: () => discoverMovies({ data: { ...params } }),
		}),
	genres: (params: WithLanguage) =>
		queryOptions({
			queryKey: ["movies", "genres", { ...params }],
			queryFn: () => getMovieGenres({ data: { ...params } }),
		}),
};

export const imdbRatingQueryOptions = (imdbId: string) =>
	queryOptions({
		queryKey: ["imdb-rating", imdbId],
		queryFn: () => getImdbRating({ data: { imdbId } }),
		staleTime: 1000 * 60 * 60 * 24,
	});

export const watchmodeStreamingSourcesQueryOptions = (imdbId: string) =>
	queryOptions({
		queryKey: ["watchmode-streaming-sources", imdbId],
		queryFn: () => getStreamingSources({ data: { imdbId } }),
	});
