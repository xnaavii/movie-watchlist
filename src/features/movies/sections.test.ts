import { beforeEach, describe, expect, it, vi } from "vitest";

const { discoverMovies, getMovieList, getTrendingMovies } = vi.hoisted(() => {
	const page = { page: 1, total_pages: 3, total_results: 60, results: [] };
	return {
		discoverMovies: vi.fn(async () => page),
		getMovieList: vi.fn(async () => page),
		getTrendingMovies: vi.fn(async () => page),
	};
});

vi.mock("./server/movies.functions", () => ({
	discoverMovies,
	getMovieList,
	getTrendingMovies,
}));

import {
	getDiscoverSection,
	listDiscoverSections,
	sectionQuery,
} from "./sections";

const horror = { id: 27, name: "Horror" };

async function fetchPage(
	query: ReturnType<typeof sectionQuery>,
	pageParam: number,
) {
	// biome-ignore lint/style/noNonNullAssertion: always set by sectionQuery
	const queryFn = query.queryFn!;
	return queryFn({ pageParam } as Parameters<typeof queryFn>[0]);
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getDiscoverSection", () => {
	it("returns unfiltered copy without a genre", () => {
		expect(getDiscoverSection("top-rated")).toEqual({
			slug: "top-rated",
			title: "Top Rated of All Time",
			description: "The highest rated movies on TMDB",
		});
	});

	it("returns genre copy for a genre", () => {
		expect(getDiscoverSection("top-rated", horror)).toMatchObject({
			title: "Top Rated",
			description: "The highest rated Horror movies on TMDB",
			genre: horror,
		});
	});

	it("rejects sections that only exist unfiltered", () => {
		expect(getDiscoverSection("trending", horror)).toBeUndefined();
		expect(getDiscoverSection("popular", horror)).toBeUndefined();
	});

	it("rejects unknown slugs", () => {
		expect(getDiscoverSection("nope")).toBeUndefined();
		expect(getDiscoverSection("toString")).toBeUndefined();
	});
});

describe("listDiscoverSections", () => {
	it("lists only genre sections for a genre", () => {
		expect(listDiscoverSections(horror).map((s) => s.slug)).toEqual([
			"new-releases",
			"coming-soon",
			"top-rated",
			"hidden-gems",
			"quick-watches",
			"timeless-classics",
		]);
	});

	it("lists every section unfiltered", () => {
		expect(listDiscoverSections()).toHaveLength(9);
	});
});

describe("sectionQuery", () => {
	it("narrows discover sections to the genre and requests the page", async () => {
		await fetchPage(sectionQuery("hidden-gems", horror.id), 2);

		expect(discoverMovies).toHaveBeenCalledWith({
			data: expect.objectContaining({ with_genres: 27, page: 2 }),
		});
	});

	it("uses TMDB's top rated list when unfiltered", async () => {
		await fetchPage(sectionQuery("top-rated"), 3);

		expect(getMovieList).toHaveBeenCalledWith({
			data: { list: "top_rated", page: 3 },
		});
		expect(discoverMovies).not.toHaveBeenCalled();
	});

	it("pages through trending", async () => {
		await fetchPage(sectionQuery("trending"), 4);

		expect(getTrendingMovies).toHaveBeenCalledWith({
			data: { time_window: "week", page: 4 },
		});
	});

	it("stops after the last page", () => {
		const { getNextPageParam } = sectionQuery("popular");
		const page = { page: 3, total_pages: 3, total_results: 60, results: [] };

		expect(getNextPageParam(page, [page], 3, [3])).toBeUndefined();
		expect(getNextPageParam({ ...page, page: 1 }, [page], 1, [1])).toBe(2);
	});
});
