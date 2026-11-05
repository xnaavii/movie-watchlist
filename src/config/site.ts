import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

/** The live domain. Canonical URLs and link previews always point here. */
export const PRODUCTION_URL = "https://watchlist.ipetrovic.com";

/**
 * Old addresses of the live site. Requests to these are permanently
 * redirected to PRODUCTION_URL (see lib/canonicalHost.ts). Preview
 * deployments (`<version>-movie-watchlist.petrovic-valpovo.workers.dev`)
 * are not listed, so they keep working.
 */
export const LEGACY_HOSTS: readonly string[] = [
	"watchlist.xnaavii.com",
	"movie-watchlist.petrovic-valpovo.workers.dev",
];

/**
 * Single source of truth for the app's branding. The PWA manifest
 * (public/manifest.json) is static, so keep it in sync by hand; a test
 * checks that the two agree.
 */
export const SITE_CONFIG = {
	name: "Watchlist",
	shortName: "Watchlist",
	/** Short pitch, used for the page title of the home page. */
	tagline: "Find something to watch, fast",
	description:
		"Find something to watch, fast, and keep track of what you're watching. Movies and TV in one watchlist, with AI picks and where to stream. Install it like an app.",
	url: PRODUCTION_URL,
	themeColor: "#0a0a0a",
	locale: "en_US",
	/** The default link preview image, in public/. */
	ogImage: {
		path: "/og-image.jpg",
		width: 1200,
		height: 630,
		alt: "Watchlist: find something to watch, fast. Movies and TV in one watchlist.",
	},
} as const;

/**
 * The origin used in canonical URLs and link previews. Production builds
 * always use the live domain, so a page opened on the workers.dev URL still
 * points search engines and previews at watchlist.ipetrovic.com. Development
 * uses whatever origin the page is served from.
 */
export const getSiteUrl = createIsomorphicFn()
	.server(() => {
		if (import.meta.env.PROD) return PRODUCTION_URL;
		try {
			return getRequestUrl().origin;
		} catch {
			return PRODUCTION_URL;
		}
	})
	.client(() =>
		import.meta.env.PROD ? PRODUCTION_URL : window.location.origin,
	);

/** An absolute URL on the site, for canonical links and link previews. */
export const absoluteUrl = (path: string) => `${getSiteUrl()}${path}`;
