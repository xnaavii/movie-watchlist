import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Runs public/sw.js against a fake Cache Storage and fetch, so its caching
 * rules can be checked without a browser.
 */

const ORIGIN = "https://watchlist.test";
const source = readFileSync(
	resolve(__dirname, "../../../public/sw.js"),
	"utf8",
);

type FakeRequest = { url: string; method: string; mode: string };
const keyOf = (request: string | FakeRequest) =>
	new URL(typeof request === "string" ? request : request.url, ORIGIN).href;

class FakeCache {
	entries = new Map<string, Response>();
	async match(request: string | FakeRequest) {
		return this.entries.get(keyOf(request))?.clone();
	}
	async put(request: string | FakeRequest, response: Response) {
		const key = keyOf(request);
		this.entries.delete(key);
		this.entries.set(key, response);
	}
	async add(request: string) {
		const response = await worker.fetch(request);
		if (!response.ok) throw new Error(`Failed to add ${request}`);
		await this.put(request, response);
	}
	async addAll(requests: string[]) {
		await Promise.all(requests.map((request) => this.add(request)));
	}
	async keys() {
		return [...this.entries.keys()].map((url) => ({ url }));
	}
	async delete(request: string | FakeRequest) {
		return this.entries.delete(keyOf(request));
	}
}

class FakeCacheStorage {
	stores = new Map<string, FakeCache>();
	async open(name: string) {
		let cache = this.stores.get(name);
		if (!cache) {
			cache = new FakeCache();
			this.stores.set(name, cache);
		}
		return cache;
	}
	async match(request: string | FakeRequest) {
		for (const cache of this.stores.values()) {
			const hit = await cache.match(request);
			if (hit) return hit;
		}
		return undefined;
	}
	async keys() {
		return [...this.stores.keys()];
	}
	async delete(name: string) {
		return this.stores.delete(name);
	}
	/** URLs saved in one cache, for assertions. */
	urls(name: string) {
		return [...(this.stores.get(name)?.entries.keys() ?? [])].map(
			(url) => new URL(url).pathname + new URL(url).search,
		);
	}
}

type Listener = (event: Record<string, unknown>) => void;

let worker: {
	listeners: Map<string, Listener>;
	caches: FakeCacheStorage;
	fetch: ReturnType<
		typeof vi.fn<(input: string | FakeRequest) => Promise<Response>>
	>;
	self: Record<string, unknown>;
	clientUrls: string[];
};

function loadWorker() {
	const listeners = new Map<string, Listener>();
	const caches = new FakeCacheStorage();
	const fetch = vi.fn<(input: string | FakeRequest) => Promise<Response>>();
	worker = {
		listeners,
		caches,
		fetch,
		clientUrls: [],
		self: {},
	};
	worker.self = {
		location: { origin: ORIGIN },
		addEventListener: (type: string, listener: Listener) =>
			listeners.set(type, listener),
		skipWaiting: vi.fn(),
		clients: {
			claim: vi.fn(async () => {}),
			matchAll: vi.fn(async () => worker.clientUrls.map((url) => ({ url }))),
		},
	};
	new Function("self", "caches", "fetch", source)(worker.self, caches, fetch);
}

/** Fires a lifecycle event and waits for everything it handed to waitUntil. */
async function lifecycle(type: string, data?: unknown) {
	const pending: Promise<unknown>[] = [];
	worker.listeners.get(type)?.({
		data,
		waitUntil: (promise: Promise<unknown>) => pending.push(promise),
	});
	await Promise.all(pending);
}

/** Fires a fetch. Resolves to undefined when the worker leaves it alone. */
async function request(
	path: string,
	{ method = "GET", mode = "cors" } = {},
): Promise<Response | undefined> {
	let response: Promise<Response> | undefined;
	const pending: Promise<unknown>[] = [];
	worker.listeners.get("fetch")?.({
		request: { url: new URL(path, ORIGIN).href, method, mode },
		respondWith: (promise: Promise<Response>) => {
			response = promise;
		},
		waitUntil: (promise: Promise<unknown>) => pending.push(promise),
	});
	if (!response) return undefined;
	const result = await response;
	await Promise.all(pending);
	return result;
}

const ok = (body: string) => new Response(body, { status: 200 });
const offline = () => Promise.reject(new TypeError("Failed to fetch"));
const pathOf = (input: string | FakeRequest) =>
	new URL(typeof input === "string" ? input : input.url, ORIGIN).pathname;

beforeEach(() => {
	loadWorker();
});

describe("service worker install", () => {
	it("saves the app shell, every build file and the start pages", async () => {
		worker.fetch.mockImplementation(async (input) => {
			const path = pathOf(input);
			if (path === "/sw-assets.json") {
				return Response.json({
					files: ["/assets/main.js", "/assets/main.css"],
				});
			}
			return ok(path);
		});

		await lifecycle("install");

		expect(worker.caches.urls("shell-v1")).toEqual(
			expect.arrayContaining(["/offline", "/manifest.json", "/favicon.svg"]),
		);
		expect(worker.caches.urls("assets-v1").sort()).toEqual([
			"/assets/main.css",
			"/assets/main.js",
		]);
		expect(worker.caches.urls("pages-v1").sort()).toEqual([
			"/discover",
			"/watchlist",
		]);
		expect(worker.self.skipWaiting).toHaveBeenCalled();
	});

	it("still installs when the build list or a page can't be fetched", async () => {
		worker.fetch.mockImplementation(async (input) => {
			const path = pathOf(input);
			if (path === "/sw-assets.json") return new Response("", { status: 404 });
			if (path === "/watchlist") throw new TypeError("Failed to fetch");
			return ok(path);
		});

		await lifecycle("install");

		expect(worker.caches.urls("pages-v1")).toEqual(["/discover"]);
		expect(worker.self.skipWaiting).toHaveBeenCalled();
	});
});

describe("service worker activate", () => {
	it("drops caches from older versions and saves the open pages", async () => {
		await worker.caches.open("pages-v0");
		await worker.caches.open("data-v1");
		worker.clientUrls = [
			`${ORIGIN}/movies/1-alien?tab=cast`,
			"https://other.test/x",
		];
		worker.fetch.mockImplementation(async (input) => ok(pathOf(input)));

		await lifecycle("activate");

		expect(await worker.caches.keys()).not.toContain("pages-v0");
		expect(await worker.caches.keys()).toContain("data-v1");
		expect(worker.caches.urls("pages-v1")).toEqual([
			"/movies/1-alien?tab=cast",
		]);
		const clients = worker.self.clients as { claim: () => void };
		expect(clients.claim).toHaveBeenCalled();
	});
});

describe("service worker fetch rules", () => {
	it("serves pages fresh online and the saved copy offline", async () => {
		worker.fetch.mockResolvedValueOnce(ok("fresh"));
		const online = await request("/discover", { mode: "navigate" });
		expect(await online?.text()).toBe("fresh");

		worker.fetch.mockImplementationOnce(offline);
		const saved = await request("/discover", { mode: "navigate" });
		expect(await saved?.text()).toBe("fresh");
	});

	it("falls back to the offline page for pages never visited", async () => {
		const shell = await worker.caches.open("shell-v1");
		await shell.put("/offline", ok("offline page"));
		worker.fetch.mockImplementation(offline);

		const response = await request("/tv/1-severance", { mode: "navigate" });
		expect(await response?.text()).toBe("offline page");
	});

	it("doesn't save error pages", async () => {
		worker.fetch.mockResolvedValueOnce(new Response("oops", { status: 500 }));
		await request("/discover", { mode: "navigate" });
		expect(worker.caches.urls("pages-v1")).toEqual([]);
	});

	it("saves server function data for offline use", async () => {
		worker.fetch.mockResolvedValueOnce(ok("data"));
		await request("/_serverFn/abc?payload=1");
		worker.fetch.mockImplementationOnce(offline);

		const response = await request("/_serverFn/abc?payload=1");
		expect(await response?.text()).toBe("data");
	});

	it("keeps the last session answer so signed-in users stay signed in offline", async () => {
		worker.fetch.mockResolvedValueOnce(ok("session"));
		await request("/api/auth/get-session");
		worker.fetch.mockImplementationOnce(offline);

		const response = await request("/api/auth/get-session");
		expect(await response?.text()).toBe("session");
	});

	it("never intercepts other API calls or non-GET requests", async () => {
		expect(await request("/api/auth/sign-in/social")).toBeUndefined();
		expect(await request("/api/auth/sign-out")).toBeUndefined();
		expect(await request("/_serverFn/add", { method: "POST" })).toBeUndefined();
		expect(worker.fetch).not.toHaveBeenCalled();
	});

	it("leaves other sites alone, except TMDB posters", async () => {
		expect(
			await request("https://api.themoviedb.org/3/movie/1"),
		).toBeUndefined();

		worker.fetch.mockResolvedValueOnce(ok("poster"));
		const poster = await request("https://image.tmdb.org/t/p/w342/a.jpg");
		expect(await poster?.text()).toBe("poster");
		expect(worker.caches.urls("images-v1")).toEqual(["/t/p/w342/a.jpg"]);
	});

	it("shows saved posters right away and refreshes them in the background", async () => {
		const images = await worker.caches.open("images-v1");
		await images.put("https://image.tmdb.org/t/p/w342/a.jpg", ok("old"));
		worker.fetch.mockResolvedValueOnce(ok("new"));

		const poster = await request("https://image.tmdb.org/t/p/w342/a.jpg");
		expect(await poster?.text()).toBe("old");
		const refreshed = await images.match(
			"https://image.tmdb.org/t/p/w342/a.jpg",
		);
		expect(await refreshed?.text()).toBe("new");
	});

	it("serves hashed build files from the cache without a request", async () => {
		const assets = await worker.caches.open("assets-v1");
		await assets.put("/assets/main-abc.js", ok("code"));

		const response = await request("/assets/main-abc.js");
		expect(await response?.text()).toBe("code");
		expect(worker.fetch).not.toHaveBeenCalled();
	});

	it("keeps each runtime cache to its limit, dropping the oldest", async () => {
		worker.fetch.mockImplementation(async (input) => ok(pathOf(input)));
		for (let i = 0; i <= 50; i++) {
			await request(`/movies/${i}`, { mode: "navigate" });
		}
		const pages = worker.caches.urls("pages-v1");
		expect(pages).toHaveLength(50);
		expect(pages).not.toContain("/movies/0");
		expect(pages).toContain("/movies/50");
	});
});

describe("service worker account switch", () => {
	it("forgets saved pages and data but keeps the app and posters", async () => {
		for (const name of ["pages-v1", "data-v1", "images-v1", "assets-v1"]) {
			await worker.caches.open(name);
		}

		await lifecycle("message", { type: "clear-user-data" });

		expect((await worker.caches.keys()).sort()).toEqual([
			"assets-v1",
			"images-v1",
		]);
	});

	it("ignores other messages", async () => {
		await worker.caches.open("data-v1");
		await lifecycle("message", { type: "something-else" });
		expect(await worker.caches.keys()).toEqual(["data-v1"]);
	});
});
