import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

/**
 * Single source of truth for the app's branding. The PWA manifest
 * (public/manifest.json) is static, so keep it in sync by hand.
 */
export const SITE_CONFIG = {
	name: "Watchlist",
	shortName: "Watchlist",
	description:
		"Find what to watch next, build your watchlist, and track what you've watched.",
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
