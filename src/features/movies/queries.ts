import type { MovieDetailsParams, MovieListParams } from "@lorenzopant/tmdb";
import { queryOptions } from "@tanstack/react-query";
import {
	getMovieDetails,
	getNowPlayingMovies,
	getPopularMovies,
	getTopRatedMovies,
	getUpcomingMovies,
} from "./server/movies.functions";

export const movieQueries = {
	list: {
		popular: (params: MovieListParams) =>
			queryOptions({
				queryKey: ["movies", "list", "popular", params],
				queryFn: () => getPopularMovies({ data: { ...params } }),
			}),
		topRated: (params: MovieListParams) =>
			queryOptions({
				queryKey: ["movies", "list", "top_rated", params],
				queryFn: () => getTopRatedMovies({ data: { ...params } }),
			}),
		nowPlaying: (params: MovieListParams) =>
			queryOptions({
				queryKey: ["movies", "list", "now_playing", params],
				queryFn: () => getNowPlayingMovies({ data: { ...params } }),
			}),
		upcoming: (params: MovieListParams) =>
			queryOptions({
				queryKey: ["movies", "list", "upcoming", params],
				queryFn: () => getUpcomingMovies({ data: { ...params } }),
			}),
	},
	details: (params: MovieDetailsParams) =>
		queryOptions({
			queryKey: ["movies", "details", { id: params.movie_id }],
			queryFn: () => getMovieDetails({ data: { ...params } }),
		}),
};
