import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tmdb = vi.hoisted(() => ({
	movie_lists: { popular: vi.fn() },
	tv_lists: { popular: vi.fn() },
	movies: { reviews: vi.fn(), images: vi.fn() },
	tv_series: { reviews: vi.fn(), images: vi.fn() },
}));

vi.mock("@tanstack/react-start", () => import("#/__tests__/serverFn"));
vi.mock("#/db", () => ({ db: {} }));
vi.mock("#/lib/tmdb", () => ({ tmdb }));

import { TMDBError } from "@lorenzopant/tmdb";
import {
	getMediaList,
	getMediaLogos,
	getMediaReviews,
} from "./media.functions";

/** The Workers Cache API, shared by every visitor at the edge. */
const store = new Map<string, Response>();

beforeEach(() => {
	store.clear();
	vi.stubGlobal("caches", {
		default: {
			match: async (request: Request) => store.get(request.url)?.clone(),
			put: async (request: Request, response: Response) => {
				store.set(request.url, response);
			},
		},
	});
	for (const group of Object.values(tmdb)) {
		for (const fn of Object.values(group)) fn.mockReset();
	}
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const page = (results: object[]) => ({
	page: 1,
	total_pages: 1,
	total_results: results.length,
	results,
});

describe("edge-cached TMDB calls", () => {
	it("ask TMDB once and serve repeats from the edge cache", async () => {
		tmdb.movie_lists.popular.mockResolvedValue(
			page([{ id: 348, title: "Alien", release_date: "1979-05-25" }]),
		);

		const first = await getMediaList({
			data: { mediaType: "movie", list: "popular", page: 1 },
		});
		const second = await getMediaList({
			data: { mediaType: "movie", list: "popular", page: 1 },
		});

		expect(tmdb.movie_lists.popular).toHaveBeenCalledOnce();
		expect(second).toEqual(first);
		expect(first.results[0]).toMatchObject({
			id: 348,
			mediaType: "movie",
			title: "Alien",
		});
	});

	it("cache each page, list and media type separately", async () => {
		tmdb.movie_lists.popular.mockResolvedValue(page([]));
		tmdb.tv_lists.popular.mockResolvedValue(page([]));

		await getMediaList({
			data: { mediaType: "movie", list: "popular", page: 1 },
		});
		await getMediaList({
			data: { mediaType: "movie", list: "popular", page: 2 },
		});
		await getMediaList({ data: { mediaType: "tv", list: "popular", page: 1 } });

		expect(tmdb.movie_lists.popular).toHaveBeenCalledTimes(2);
		expect(tmdb.tv_lists.popular).toHaveBeenCalledOnce();
		expect(store.size).toBe(3);
	});

	it("turn TMDB errors into readable ones and don't cache them", async () => {
		tmdb.movies.reviews.mockRejectedValueOnce(
			new TMDBError("The resource you requested could not be found.", 404),
		);
		await expect(
			getMediaReviews({ data: { mediaType: "movie", id: 1 } }),
		).rejects.toThrow("The resource you requested could not be found.");

		tmdb.tv_series.reviews.mockRejectedValueOnce(new Error("socket hang up"));
		await expect(
			getMediaReviews({ data: { mediaType: "tv", id: 1 } }),
		).rejects.toThrow("Failed to get reviews");

		expect(store.size).toBe(0);
		tmdb.movies.reviews.mockResolvedValue(page([]));
		await getMediaReviews({ data: { mediaType: "movie", id: 1 } });
		expect(tmdb.movies.reviews).toHaveBeenCalledTimes(2);
	});
});

describe("getMediaLogos", () => {
	it("returns a whole row's logos, caching titles without a logo too", async () => {
		tmdb.movies.images.mockResolvedValue({
			id: 1,
			logos: [{ file_path: "/logo.png", iso_639_1: "en", vote_average: 5 }],
		});
		tmdb.tv_series.images.mockResolvedValue({ id: 2, logos: [] });
		const refs = [
			{ mediaType: "movie" as const, id: 1 },
			{ mediaType: "tv" as const, id: 2 },
		];

		const logos = await getMediaLogos({ data: refs });
		await getMediaLogos({ data: refs });

		expect(logos["movie:1"]).toMatch(/logo\.png$/);
		expect(logos["tv:2"]).toBeUndefined();
		expect(tmdb.movies.images).toHaveBeenCalledOnce();
		expect(tmdb.tv_series.images).toHaveBeenCalledOnce();
	});

	it("skips a title whose images fail instead of failing the row", async () => {
		tmdb.movies.images.mockRejectedValue(new Error("TMDB down"));
		await expect(
			getMediaLogos({ data: [{ mediaType: "movie", id: 1 }] }),
		).resolves.toEqual({ "movie:1": undefined });
	});

	it("caps a request at one row of titles", async () => {
		tmdb.movies.images.mockResolvedValue({ id: 1, logos: [] });
		const refs = Array.from({ length: 40 }, (_, i) => ({
			mediaType: "movie" as const,
			id: i + 1,
		}));
		const logos = await getMediaLogos({ data: refs });
		expect(Object.keys(logos)).toHaveLength(24);
	});
});
