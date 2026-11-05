import { createMiddleware } from "@tanstack/react-start";
import { LEGACY_HOSTS, PRODUCTION_URL } from "#/config/site";

/**
 * Where a request to an old address of the site should go instead, keeping
 * the path and query. Returns null for the live domain, previews and local dev.
 */
export function canonicalRedirectUrl(requestUrl: string): string | null {
	const url = new URL(requestUrl);
	if (!LEGACY_HOSTS.includes(url.hostname)) return null;
	return `${PRODUCTION_URL}${url.pathname}${url.search}`;
}

/**
 * Sends every request that arrives on an old address (workers.dev, the old
 * domain) to the live domain, so sign-in cookies and Google's redirect always
 * land on one host. 308 keeps the method and body of POST requests.
 */
export const canonicalHostMiddleware = createMiddleware().server(
	({ request, next }) => {
		const location = canonicalRedirectUrl(request.url);
		if (location) {
			return new Response(null, { status: 308, headers: { location } });
		}
		return next();
	},
);
