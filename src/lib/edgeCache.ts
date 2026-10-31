/** Keys only need to be unique; this host is never requested. */
const CACHE_ORIGIN = "https://edge-cache.watchlist.internal";

export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;

function defaultCache(): Cache | undefined {
	if (typeof caches === "undefined" || !("default" in caches)) return undefined;
	return (caches as unknown as { default: Cache }).default;
}

/**
 * Shares a JSON result between every visitor through the Workers Cache API,
 * so the same TMDB response isn't fetched again for each person. Cache misses
 * and errors fall through to `load`. On *.workers.dev previews the Cache API
 * stores nothing, so every call loads fresh there.
 */
export async function edgeCached<T>(
	key: string,
	ttlSeconds: number,
	load: () => Promise<T>,
): Promise<T> {
	const cache = defaultCache();
	if (!cache) return load();

	const request = new Request(`${CACHE_ORIGIN}/${encodeURIComponent(key)}`);
	try {
		const hit = await cache.match(request);
		if (hit) return (await hit.json()) as T;
	} catch {
		// A broken entry is treated as a miss.
	}

	const value = await load();
	const response = new Response(JSON.stringify(value), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": `public, max-age=${ttlSeconds}`,
		},
	});
	try {
		await cache.put(request, response);
	} catch {
		// Not caching only costs a fetch next time.
	}
	return value;
}
