import type {
	MovieDetailsParams,
	MovieListParams,
	MovieVideosParams,
	SearchMoviesParams,
} from "@lorenzopant/tmdb";
import { queryOptions } from "@tanstack/react-query";
import {
	getImdbRating,
	getMovieDetails,
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
	search: (params: SearchMoviesParams) =>
		queryOptions({
			queryKey: ["movies", "search", { ...params }],
			queryFn: () => searchMovies({ data: { ...params } }),
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
