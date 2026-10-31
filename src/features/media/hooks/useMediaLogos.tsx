import { useQuery } from "@tanstack/react-query";
import { mediaQueries } from "#/features/media/queries";
import type { MediaRef } from "../types";

/** Logo URLs for a row of titles, keyed by mediaKey. Empty until loaded. */
export function useMediaLogos(
	items: MediaRef[],
): Record<string, string | undefined> {
	const refs = items.map(({ mediaType, id }) => ({ mediaType, id }));
	const { data } = useQuery(mediaQueries.logos(refs));
	return data ?? {};
}
