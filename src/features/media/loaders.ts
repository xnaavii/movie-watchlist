import type { QueryClient } from "@tanstack/react-query";
import { mediaQueries } from "./queries";
import type { MediaDetails, MediaRef } from "./types";

/**
 * Loads a title's details for its page. Throws when TMDB doesn't know it.
 * Every other section fetches its own data when it renders, and the ones below
 * the fold wait until they scroll into view.
 */
export function loadMediaDetails(
	queryClient: QueryClient,
	ref: MediaRef,
): Promise<MediaDetails> {
	return queryClient.query({
		...mediaQueries.details(ref),
		staleTime: "static",
	});
}
