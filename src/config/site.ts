import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

export const SITE_CONFIG = {
	name: "Movie Watchlist",
	url: import.meta.env.VITE_SITE_URL ?? "http://localhost:3000",
} as const;

/**
 * The origin the page is being served from, so absolute URLs in link
 * previews match whichever domain the request came in on.
 */
export const getSiteUrl = createIsomorphicFn()
	.server(() => {
		try {
			return getRequestUrl().origin;
		} catch {
			return new URL(SITE_CONFIG.url).origin;
		}
	})
	.client(() => window.location.origin);
