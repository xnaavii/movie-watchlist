/* Watchlist service worker: keeps visited pages, their data and posters
 * available offline. Hand-written so there is no build step to maintain.
 * Bump VERSION to drop every cache on the next visit. */
const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const PAGE_CACHE = `pages-${VERSION}`;
const DATA_CACHE = `data-${VERSION}`;
const IMAGE_CACHE = `images-${VERSION}`;
const CURRENT = [SHELL_CACHE, ASSET_CACHE, PAGE_CACHE, DATA_CACHE, IMAGE_CACHE];

// Static assets drop the .html, so this is public/offline.html.
// Assets vary on Origin, which module scripts send and precaching doesn't.
const MATCH = { ignoreVary: true };

const OFFLINE_URL = "/offline";
const SHELL_FILES = [
	OFFLINE_URL,
	"/manifest.json",
	"/favicon.svg",
	"/android-chrome-192x192.png",
];

/** Most entries each runtime cache keeps, oldest dropped first. */
const LIMITS = {
	[PAGE_CACHE]: 50,
	[DATA_CACHE]: 300,
	[IMAGE_CACHE]: 400,
	[ASSET_CACHE]: 600,
};

/** Saves every page's JS and CSS, so pages not opened yet still load offline. */
async function precacheBuild() {
	const response = await fetch("/sw-assets.json", { cache: "no-cache" });
	if (!response.ok) return;
	const { files } = await response.json();
	const cache = await caches.open(ASSET_CACHE);
	await Promise.allSettled(
		files.map(async (file) => {
			if (!(await cache.match(file, MATCH))) await cache.add(file);
		}),
	);
}

/** The start page and the watchlist, so the installed app opens offline. */
const START_PAGES = ["/discover", "/watchlist"];

/** Saves pages as the browser would load them, skipping any that fail. */
async function savePages(urls) {
	const cache = await caches.open(PAGE_CACHE);
	await Promise.allSettled(
		urls.map(async (url) => {
			const response = await fetch(url, { credentials: "include" });
			if (response.ok && !response.redirected) await cache.put(url, response);
		}),
	);
}

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(SHELL_CACHE)
			.then((cache) => cache.addAll(SHELL_FILES))
			.then(() =>
				Promise.all([
					precacheBuild().catch(() => {}),
					savePages(START_PAGES).catch(() => {}),
				]),
			)
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => !CURRENT.includes(key))
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim())
			// The page that installed the worker loaded before it, so save it now.
			.then(() => self.clients.matchAll({ type: "window" }))
			.then((clients) =>
				savePages(
					clients
						.map((client) => new URL(client.url))
						.filter((url) => url.origin === self.location.origin)
						.map((url) => url.pathname + url.search),
				),
			)
			.catch(() => {}),
	);
});

// The app asks for this when the signed-in user changes, so one account's
// saved data is never shown to another on a shared browser.
self.addEventListener("message", (event) => {
	if (event.data?.type === "clear-user-data") {
		event.waitUntil(
			Promise.all([caches.delete(DATA_CACHE), caches.delete(PAGE_CACHE)]),
		);
	}
});

async function trim(cacheName) {
	const limit = LIMITS[cacheName];
	if (!limit) return;
	const cache = await caches.open(cacheName);
	const keys = await cache.keys();
	await Promise.all(
		keys.slice(0, Math.max(0, keys.length - limit)).map((key) => cache.delete(key)),
	);
}

async function put(cacheName, request, response) {
	const cache = await caches.open(cacheName);
	await cache.put(request, response);
	await trim(cacheName);
}

/** Fresh when online; the last saved copy when not. */
async function networkFirst(event, cacheName, fallbackUrl) {
	try {
		const response = await fetch(event.request);
		if (response.ok) {
			event.waitUntil(put(cacheName, event.request, response.clone()));
		}
		return response;
	} catch (error) {
		const cached = await caches.match(event.request, MATCH);
		if (cached) return cached;
		if (fallbackUrl) {
			const fallback = await caches.match(fallbackUrl);
			if (fallback) return fallback;
		}
		throw error;
	}
}

/** Saved copy right away, refreshed in the background. */
async function staleWhileRevalidate(event, cacheName) {
	const cached = await caches.match(event.request, MATCH);
	const refresh = fetch(event.request)
		.then((response) => {
			// Cross-origin images come back opaque (status 0); keep those too.
			if (response.ok || response.type === "opaque") {
				return put(cacheName, event.request, response.clone()).then(
					() => response,
				);
			}
			return response;
		})
		.catch(() => cached);
	if (cached) {
		event.waitUntil(refresh);
		return cached;
	}
	return refresh;
}

/** Hashed build files never change, so a saved copy is always right. */
async function cacheFirst(event, cacheName) {
	const cached = await caches.match(event.request, MATCH);
	if (cached) return cached;
	const response = await fetch(event.request);
	if (response.ok) event.waitUntil(put(cacheName, event.request, response.clone()));
	return response;
}

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") return;
	const url = new URL(request.url);

	if (url.hostname === "image.tmdb.org") {
		event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE));
		return;
	}
	if (url.origin !== self.location.origin) return;
	// Offline, the last session answer keeps a signed-in user signed in.
	if (url.pathname === "/api/auth/get-session") {
		event.respondWith(networkFirst(event, DATA_CACHE));
		return;
	}
	// Sign-in and sign-out must always reach the server.
	if (url.pathname.startsWith("/api/")) return;

	if (request.mode === "navigate") {
		event.respondWith(networkFirst(event, PAGE_CACHE, OFFLINE_URL));
		return;
	}
	if (url.pathname.startsWith("/assets/")) {
		event.respondWith(cacheFirst(event, ASSET_CACHE));
		return;
	}
	if (url.pathname.startsWith("/_serverFn/")) {
		event.respondWith(networkFirst(event, DATA_CACHE));
		return;
	}
	if (SHELL_FILES.includes(url.pathname)) {
		event.respondWith(staleWhileRevalidate(event, SHELL_CACHE));
	}
});
