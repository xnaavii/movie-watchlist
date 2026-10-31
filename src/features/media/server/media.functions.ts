import { createServerFn } from "@tanstack/react-start";
import {
	imdbIdRequestSchema,
	mediaDiscoverRequestSchema,
	mediaImagesRequestSchema,
	mediaListRequestSchema,
	mediaLogosRequestSchema,
	mediaPageRequestSchema,
	mediaRefSchema,
	mediaTypeRequestSchema,
	searchRequestSchema,
	trendingRequestSchema,
} from "../schemas";
import {
	fetchAuthShowcase,
	fetchDiscoverResults,
	fetchImdbRating,
	fetchLanguages,
	fetchMediaCredits,
	fetchMediaDetails,
	fetchMediaGenres,
	fetchMediaImages,
	fetchMediaList,
	fetchMediaLogos,
	fetchMediaRecommendations,
	fetchMediaReviews,
	fetchMediaVideos,
	fetchMediaWatchProviders,
	fetchSearchResults,
	fetchTrendingMedia,
} from "./media.server";

/**
 * Media endpoints the client calls. Each one validates its input and hands
 * off to media.server.ts, which does the work.
 */

export const getMediaDetails = createServerFn({ method: "GET" })
	.validator(mediaRefSchema)
	.handler(({ data }) => fetchMediaDetails(data));

export const getMediaList = createServerFn({ method: "GET" })
	.validator(mediaListRequestSchema)
	.handler(({ data }) => fetchMediaList(data));

export const getMediaRecommendations = createServerFn({ method: "GET" })
	.validator(mediaPageRequestSchema)
	.handler(({ data }) => fetchMediaRecommendations(data));

export const getMediaReviews = createServerFn({ method: "GET" })
	.validator(mediaPageRequestSchema)
	.handler(({ data }) => fetchMediaReviews(data));

export const getMediaCredits = createServerFn({ method: "GET" })
	.validator(mediaRefSchema)
	.handler(({ data }) => fetchMediaCredits(data));

export const getMediaVideos = createServerFn({ method: "GET" })
	.validator(mediaRefSchema)
	.handler(({ data }) => fetchMediaVideos(data));

/**
 * Logo URLs for a whole row in one request, keyed by mediaKey. Sends only the
 * paths, not every poster and backdrop TMDB lists. A missing logo is undefined.
 */
export const getMediaLogos = createServerFn({ method: "GET" })
	.validator(mediaLogosRequestSchema)
	.handler(({ data }) => fetchMediaLogos(data));

export const getMediaImages = createServerFn({ method: "GET" })
	.validator(mediaImagesRequestSchema)
	.handler(({ data }) => fetchMediaImages(data));

export const getMediaWatchProviders = createServerFn({ method: "GET" })
	.validator(mediaRefSchema)
	.handler(({ data }) => fetchMediaWatchProviders(data));

export const getMediaGenres = createServerFn({ method: "GET" })
	.validator(mediaTypeRequestSchema)
	.handler(({ data }) => fetchMediaGenres(data));

export const getLanguages = createServerFn({ method: "GET" }).handler(() =>
	fetchLanguages(),
);

export const discoverMedia = createServerFn({ method: "GET" })
	.validator(mediaDiscoverRequestSchema)
	.handler(({ data }) => fetchDiscoverResults(data));

export const getTrendingMedia = createServerFn({ method: "GET" })
	.validator(trendingRequestSchema)
	.handler(({ data }) => fetchTrendingMedia(data));

/**
 * Searches movies and TV shows together. The first page also looks for a
 * person the query names.
 */
export const searchMedia = createServerFn({ method: "GET" })
	.validator(searchRequestSchema)
	.handler(({ data }) => fetchSearchResults(data));

/**
 * Trending movies with their logos for the auth page showcase. Never throws:
 * an empty list tells the page to keep its stock background.
 */
export const getAuthShowcase = createServerFn({ method: "GET" }).handler(() =>
	fetchAuthShowcase(),
);

export const getImdbRating = createServerFn({ method: "GET" })
	.validator(imdbIdRequestSchema)
	.handler(({ data }) => fetchImdbRating(data));
