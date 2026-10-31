import type { TrendingTimeWindow } from "@lorenzopant/tmdb";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { type DiscoverGenre, toWithGenres } from "./genres";
import type { MediaDiscoverRequest } from "./schemas";
import {
	discoverMedia,
	getAuthShowcase,
	getImdbRating,
	getLanguages,
	getMediaCredits,
	getMediaDetails,
	getMediaGenres,
	getMediaImages,
	getMediaList,
	getMediaLogos,
	getMediaRecommendations,
	getMediaReviews,
	getMediaVideos,
	getMediaWatchProviders,
	getTrendingMedia,
	searchMedia,
} from "./server/media.functions";
import type {
	MediaListRequest,
	MediaRef,
	MediaType,
	SmartSearchParams,
} from "./types";

const nextPage = (lastPage: { page: number; total_pages: number }) =>
	lastPage.page >= lastPage.total_pages ? undefined : lastPage.page + 1;

/**
 * Queries for movies and TV shows. Every key starts with "media"; per-title
 * keys follow it with the media type and id, so one title's data can be
 * found or invalidated together.
 */
export const mediaQueries = {
	list: (request: MediaListRequest) =>
		queryOptions({
			queryKey: ["media", request.mediaType, "list", request.list],
			queryFn: () => getMediaList({ data: request }),
		}),
	infiniteList: (request: MediaListRequest) =>
		infiniteQueryOptions({
			queryKey: ["media", request.mediaType, "list", request.list, "infinite"],
			queryFn: ({ pageParam }) =>
				getMediaList({ data: { ...request, page: pageParam } }),
			initialPageParam: 1,
			getNextPageParam: nextPage,
		}),
	details: (ref: MediaRef) =>
		queryOptions({
			queryKey: ["media", ref.mediaType, ref.id, "details"],
			queryFn: () => getMediaDetails({ data: ref }),
		}),
	images: (ref: MediaRef) =>
		queryOptions({
			queryKey: ["media", ref.mediaType, ref.id, "images"],
			queryFn: () =>
				getMediaImages({
					data: {
						mediaType: ref.mediaType,
						id: ref.id,
						include_image_language: ["en", "null"],
					},
				}),
		}),
	/** Logo URLs for a row of titles, fetched in one request. */
	logos: (refs: MediaRef[]) =>
		queryOptions({
			queryKey: [
				"media",
				"logos",
				refs.map(({ mediaType, id }) => `${mediaType}:${id}`),
			],
			queryFn: () => getMediaLogos({ data: refs }),
			enabled: refs.length > 0,
		}),
	gallery: (ref: MediaRef) =>
		queryOptions({
			queryKey: ["media", ref.mediaType, ref.id, "images", "gallery"],
			queryFn: () =>
				getMediaImages({
					data: {
						mediaType: ref.mediaType,
						id: ref.id,
						include_image_language: ["null"],
					},
				}),
		}),
	watchProviders: (ref: MediaRef) =>
		queryOptions({
			queryKey: ["media", ref.mediaType, ref.id, "watchProviders"],
			queryFn: () =>
				getMediaWatchProviders({
					data: { mediaType: ref.mediaType, id: ref.id },
				}),
			staleTime: 1000 * 60 * 60 * 6,
		}),
	videos: (ref: MediaRef) =>
		queryOptions({
			queryKey: ["media", ref.mediaType, ref.id, "videos"],
			queryFn: () =>
				getMediaVideos({ data: { mediaType: ref.mediaType, id: ref.id } }),
		}),
	credits: (ref: MediaRef) =>
		queryOptions({
			queryKey: ["media", ref.mediaType, ref.id, "credits"],
			queryFn: () =>
				getMediaCredits({ data: { mediaType: ref.mediaType, id: ref.id } }),
		}),
	recommendations: (ref: MediaRef) =>
		queryOptions({
			queryKey: ["media", ref.mediaType, ref.id, "recommendations"],
			queryFn: () =>
				getMediaRecommendations({
					data: { mediaType: ref.mediaType, id: ref.id },
				}),
		}),
	reviews: (ref: MediaRef) =>
		queryOptions({
			queryKey: ["media", ref.mediaType, ref.id, "reviews"],
			queryFn: () =>
				getMediaReviews({ data: { mediaType: ref.mediaType, id: ref.id } }),
		}),
	infiniteSearch: (query: string) =>
		infiniteQueryOptions({
			queryKey: ["media", "search", { query }],
			queryFn: ({ pageParam }) =>
				searchMedia({ data: { query, ...pageParam } }),
			initialPageParam: {} as Omit<SmartSearchParams, "query">,
			getNextPageParam: (lastPage) =>
				lastPage.page >= lastPage.total_pages
					? undefined
					: { page: lastPage.page + 1, resolved: lastPage.resolved },
			enabled: query.trim().length > 0,
		}),
	discover: (request: MediaDiscoverRequest) =>
		queryOptions({
			queryKey: ["media", request.mediaType, "discover", request.params],
			queryFn: () => discoverMedia({ data: request }),
		}),
	infiniteDiscover: (request: MediaDiscoverRequest) =>
		infiniteQueryOptions({
			queryKey: [
				"media",
				request.mediaType,
				"discover",
				request.params,
				"infinite",
			],
			queryFn: ({ pageParam }) =>
				discoverMedia({
					data: {
						...request,
						params: { ...request.params, page: pageParam },
					} as MediaDiscoverRequest,
				}),
			initialPageParam: 1,
			getNextPageParam: nextPage,
		}),
	trending: (mediaType: MediaType, timeWindow: TrendingTimeWindow = "week") =>
		queryOptions({
			queryKey: ["media", mediaType, "trending", timeWindow],
			queryFn: () =>
				getTrendingMedia({ data: { mediaType, time_window: timeWindow } }),
		}),
	genres: (mediaType: MediaType) =>
		queryOptions({
			queryKey: ["media", mediaType, "genres"],
			queryFn: () => getMediaGenres({ data: { mediaType } }),
			staleTime: Infinity,
		}),
	languages: () =>
		queryOptions({
			queryKey: ["media", "languages"],
			queryFn: () => getLanguages(),
			staleTime: Infinity,
			select: (languages) =>
				[...languages].sort((a, b) =>
					a.english_name.localeCompare(b.english_name),
				),
		}),
	authShowcase: () =>
		queryOptions({
			queryKey: ["media", "authShowcase"],
			queryFn: () => getAuthShowcase(),
			staleTime: 1000 * 60 * 60,
		}),
	imdbRating: (imdbId: string) =>
		queryOptions({
			queryKey: ["media", "imdbRating", imdbId],
			queryFn: () => getImdbRating({ data: { imdbId } }),
			staleTime: 1000 * 60 * 60 * 24,
			enabled: imdbId.length > 0,
		}),
	/** The popular titles of one type in a genre, as an endless list. */
	popularInGenre: (genre: DiscoverGenre, mediaType: MediaType) =>
		mediaQueries.infiniteDiscover({
			mediaType,
			params: { with_genres: toWithGenres(genre, mediaType) },
		} as MediaDiscoverRequest),
};

/** With no query, search shows what's popular in the picked type. */
export const popularList = (type: MediaType | undefined): MediaListRequest =>
	type === "tv"
		? { mediaType: "tv", list: "popular" }
		: { mediaType: "movie", list: "popular" };
