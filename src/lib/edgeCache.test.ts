import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { edgeCached } from "./edgeCache";

const store = new Map<string, Response>();
const fakeCache = {
	match: async (request: Request) => store.get(request.url)?.clone(),
	put: async (request: Request, response: Response) => {
		store.set(request.url, response);
	},
};

beforeEach(() => {
	store.clear();
	vi.stubGlobal("caches", { default: fakeCache });
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("edgeCached", () => {
	it("loads once and serves later calls from the cache", async () => {
		const load = vi.fn(async () => ({ page: 1, results: [1, 2] }));

		const first = await edgeCached("trending", 60, load);
		const second = await edgeCached("trending", 60, load);

		expect(first).toEqual({ page: 1, results: [1, 2] });
		expect(second).toEqual(first);
		expect(load).toHaveBeenCalledOnce();
	});

	it("keeps entries apart by key", async () => {
		await edgeCached("a", 60, async () => "a");
		expect(await edgeCached("b", 60, async () => "b")).toBe("b");
	});

	it("doesn't cache failures", async () => {
		await expect(
			edgeCached("broken", 60, async () => {
				throw new Error("TMDB down");
			}),
		).rejects.toThrow("TMDB down");
		expect(store.size).toBe(0);
	});

	it("just loads when there is no Cache API", async () => {
		vi.stubGlobal("caches", undefined);
		const load = vi.fn(async () => 1);
		await edgeCached("x", 60, load);
		await edgeCached("x", 60, load);
		expect(load).toHaveBeenCalledTimes(2);
	});
	it("stores entries with the TTL as their max age", async () => {
		await edgeCached("details:movie 1", 3600, async () => ({ id: 1 }));
		const [[url, response]] = [...store.entries()];
		expect(url).toContain(encodeURIComponent("details:movie 1"));
		expect(response?.headers.get("Cache-Control")).toBe("public, max-age=3600");
		expect(response?.headers.get("Content-Type")).toBe("application/json");
	});

	it("caches null, so a missing logo isn't looked up again", async () => {
		const load = vi.fn(async () => null);
		await edgeCached("logo", 60, load);
		expect(await edgeCached("logo", 60, load)).toBeNull();
		expect(load).toHaveBeenCalledOnce();
	});

	it("treats a broken entry as a miss", async () => {
		store.set(
			"https://edge-cache.watchlist.internal/bad",
			new Response("{not json"),
		);
		expect(await edgeCached("bad", 60, async () => "fresh")).toBe("fresh");
	});

	it("still returns the value when the cache can't store it", async () => {
		vi.stubGlobal("caches", {
			default: {
				match: async () => undefined,
				put: async () => {
					throw new Error("Quota exceeded");
				},
			},
		});
		expect(await edgeCached("x", 60, async () => 42)).toBe(42);
	});
});
