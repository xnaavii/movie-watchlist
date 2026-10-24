import type { QueryClient } from "@tanstack/react-query";
import { watchlistQueries } from "#/features/watchlist/queries";
import { imdbRatingQueryOptions, mediaQueries } from "./queries";
import type { MediaDetails, MediaRef } from "./types";

/** Loads a title's details for its page. Throws when TMDB doesn't know it. */
export function loadMediaDetails(
	queryClient: QueryClient,
	ref: MediaRef,
): Promise<MediaDetails> {
	return queryClient.query({
		...mediaQueries.details(ref),
		staleTime: "static",
	});
}

/** Warms up every section of a details page. Failures only hide a section. */
export async function preloadMediaDetailsPage(
	queryClient: QueryClient,
	media: MediaDetails,
) {
	const ref: MediaRef = { mediaType: media.mediaType, id: media.id };
	await Promise.allSettled([
		queryClient.query({ ...mediaQueries.credits(ref), staleTime: "static" }),
		queryClient.query({ ...mediaQueries.images(ref), staleTime: "static" }),
		queryClient.query({
			...mediaQueries.recommendations(ref),
			staleTime: "static",
		}),
		queryClient.query({ ...mediaQueries.reviews(ref), staleTime: "static" }),
		queryClient.query({
			...mediaQueries.watchProviders(ref),
			staleTime: "static",
		}),
		queryClient.query({
			...watchlistQueries.status(ref),
			staleTime: "static",
		}),
		...(media.imdbId
			? [
					queryClient.query({
						...imdbRatingQueryOptions(media.imdbId),
						staleTime: "static",
					}),
				]
			: []),
	]);
}
