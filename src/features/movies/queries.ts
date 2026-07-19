import type {
	DiscoverMovieParams,
	MovieCreditsParams,
	MovieDetailsParams,
	MovieImagesParams,
	MovieListParams,
	MovieRecommendationsParams,
	MovieVideosParams,
	SearchMoviesParams,
	WithLanguage,
} from "@lorenzopant/tmdb";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
	discoverMovies,
	getImdbRating,
	getLanguages,
	getMovieCredits,
	getMovieDetails,
	getMovieGenres,
	getMovieImages,
	getMovieList,
	getMovieRecommendations,
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
	images: (params: MovieImagesParams) =>
		queryOptions({
			queryKey: ["movies", "images", { ...params }],
			queryFn: () => getMovieImages({ data: { ...params, language: "en" } }),
		}),
	videos: (params: MovieVideosParams) =>
		queryOptions({
			queryKey: ["movies", "videos", { ...params }],
			queryFn: () => getMovieVideos({ data: { ...params } }),
		}),
	credits: (params: MovieCreditsParams) =>
		queryOptions({
			queryKey: ["movies", "credits", { ...params }],
			queryFn: () => getMovieCredits({ data: { ...params } }),
		}),
	search: (params: SearchMoviesParams) =>
		queryOptions({
			queryKey: ["movies", "search", { ...params }],
			queryFn: () => searchMovies({ data: { ...params } }),
		}),
	discover: (params: DiscoverMovieParams) =>
		infiniteQueryOptions({
			queryKey: ["movies", "discover", { ...params }],
			queryFn: ({ pageParam }) =>
				discoverMovies({ data: { ...params, page: pageParam } }),
			initialPageParam: 1,
			getNextPageParam: (lastPage) =>
				lastPage.page >= lastPage.total_pages ? undefined : lastPage.page + 1,
		}),
	recommendations: (params: MovieRecommendationsParams) =>
		queryOptions({
			queryKey: ["movies", "recommendations", { ...params }],
			queryFn: () => getMovieRecommendations({ data: { ...params } }),
		}),
	genres: (params: WithLanguage) =>
		queryOptions({
			queryKey: ["movies", "genres", { ...params }],
			queryFn: () => getMovieGenres({ data: { ...params } }),
		}),
	languages: () =>
		queryOptions({
			queryKey: ["movies", "languages"],
			queryFn: () => getLanguages(),
			staleTime: Infinity,
			select: (languages) =>
				[...languages].sort((a, b) =>
					a.english_name.localeCompare(b.english_name),
				),
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
