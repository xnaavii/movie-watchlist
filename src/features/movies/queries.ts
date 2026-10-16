import type {
	DiscoverMovieParams,
	MovieCreditsParams,
	MovieDetailsParams,
	MovieImagesParams,
	MovieListParams,
	MovieRecommendationsParams,
	MovieReviewsParams,
	MovieVideosParams,
	TrendingParams,
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
	getMovieReviews,
	getMovieVideos,
	getMovieWatchProviders,
	getStreamingSources,
	getTrendingMovies,
	searchMovies,
} from "./server/movies.functions";
import type { SmartSearchParams, TMDBMovieList } from "./types";

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
	gallery: (params: { movie_id: number }) =>
		queryOptions({
			queryKey: ["movies", "images", "gallery", { ...params }],
			queryFn: () =>
				getMovieImages({
					data: { ...params, include_image_language: ["null"] },
				}),
		}),
	watchProviders: (params: { movie_id: number }) =>
		queryOptions({
			queryKey: ["movies", "watchProviders", { ...params }],
			queryFn: () => getMovieWatchProviders({ data: { ...params } }),
			staleTime: 1000 * 60 * 60 * 6,
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
	infiniteList: (list: TMDBMovieList) =>
		infiniteQueryOptions({
			queryKey: ["movies", "list", "infinite", { list }],
			queryFn: ({ pageParam }) =>
				getMovieList({ data: { list, page: pageParam } }),
			initialPageParam: 1,
			getNextPageParam: (lastPage) =>
				lastPage.page >= lastPage.total_pages ? undefined : lastPage.page + 1,
		}),
	infiniteSearch: (query: string) =>
		infiniteQueryOptions({
			queryKey: ["movies", "search", { query }],
			queryFn: ({ pageParam }) =>
				searchMovies({ data: { query, ...pageParam } }),
			initialPageParam: {} as Omit<SmartSearchParams, "query">,
			getNextPageParam: (lastPage) =>
				lastPage.page >= lastPage.total_pages
					? undefined
					: { page: lastPage.page + 1, resolved: lastPage.resolved },
			enabled: query.trim().length > 0,
		}),
	discover: (params: DiscoverMovieParams) =>
		queryOptions({
			queryKey: ["movies", "discover", params],
			queryFn: () => discoverMovies({ data: params }),
		}),
	infiniteDiscover: (params: DiscoverMovieParams) =>
		infiniteQueryOptions({
			queryKey: ["movies", "discover", { ...params }],
			queryFn: ({ pageParam }) =>
				discoverMovies({ data: { ...params, page: pageParam } }),
			initialPageParam: 1,
			getNextPageParam: (lastPage) =>
				lastPage.page >= lastPage.total_pages ? undefined : lastPage.page + 1,
		}),
	trending: (params: TrendingParams) =>
		queryOptions({
			queryKey: ["movies", "trending", { ...params }],
			queryFn: () => getTrendingMovies({ data: { ...params } }),
		}),
	recommendations: (params: MovieRecommendationsParams) =>
		queryOptions({
			queryKey: ["movies", "recommendations", { ...params }],
			queryFn: () => getMovieRecommendations({ data: { ...params } }),
		}),
	reviews: (params: MovieReviewsParams) =>
		queryOptions({
			queryKey: ["movies", "reviews", { ...params }],
			queryFn: () => getMovieReviews({ data: { ...params } }),
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
	streamingSources: (imdbId: string) =>
		queryOptions({
			queryKey: ["movie", "streamingSources", imdbId],
			queryFn: () => getStreamingSources({ data: { imdbId } }),
		}),
};

export const imdbRatingQueryOptions = (imdbId: string) =>
	queryOptions({
		queryKey: ["imdb-rating", imdbId],
		queryFn: () => getImdbRating({ data: { imdbId } }),
		staleTime: 1000 * 60 * 60 * 24,
	});
