import { beforeEach, describe, expect, it, vi } from "vitest";

const { discoverMedia, getMediaList, getTrendingMedia } = vi.hoisted(() => {
	const page = { page: 1, total_pages: 3, total_results: 60, results: [] };
	return {
		discoverMedia: vi.fn(async () => page),
		getMediaList: vi.fn(async () => page),
		getTrendingMedia: vi.fn(async () => page),
	};
});

vi.mock("./server/media.functions", () => ({
	discoverMedia,
	getMediaList,
	getTrendingMedia,
}));

import type { DiscoverGenre } from "./genres";
import {
	getDiscoverSection,
	listDiscoverSections,
	sectionQuery,
} from "./sections";

const horror: DiscoverGenre = {
	slug: "horror",
	name: "Horror",
	ids: { movie: [27], tv: [] },
};
const crime: DiscoverGenre = {
	slug: "crime",
	name: "Crime",
	ids: { movie: [80], tv: [80] },
};

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
			mediaType: "movie",
			title: "Top Rated Movies",
			description: "The highest rated movies on TMDB",
		});
	});

	it("returns genre copy for a genre", () => {
		expect(getDiscoverSection("top-rated", horror)).toMatchObject({
			title: "Top Rated Movies",
			description: "The highest rated Horror movies on TMDB",
			genre: horror,
		});
	});

	it("rejects sections that only exist unfiltered", () => {
		expect(getDiscoverSection("trending", horror)).toBeUndefined();
		expect(getDiscoverSection("popular", horror)).toBeUndefined();
	});

	it("rejects sections of a type the genre doesn't have", () => {
		expect(getDiscoverSection("top-rated-tv-shows", horror)).toBeUndefined();
		expect(getDiscoverSection("top-rated-tv-shows", crime)).toMatchObject({
			description: "The highest rated Crime shows on TMDB",
		});
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
			"top-rated",
			"coming-soon",
			"hidden-gems",
			"quick-watches",
			"timeless-classics",
		]);
	});

	it("alternates movies and shows for a genre with both", () => {
		expect(listDiscoverSections(crime).map((s) => s.slug)).toEqual([
			"new-releases",
			"new-series",
			"top-rated",
			"top-rated-tv-shows",
			"on-the-air",
			"coming-soon",
			"hidden-gems",
			"hidden-gem-series",
			"quick-watches",
			"popular-tv-shows",
			"timeless-classics",
		]);
	});

	it("lists every section unfiltered", () => {
		expect(listDiscoverSections()).toHaveLength(15);
	});

	it("lists only one media type when asked", () => {
		expect(listDiscoverSections(undefined, "tv").map((s) => s.slug)).toEqual([
			"trending-tv-shows",
			"new-series",
			"top-rated-tv-shows",
			"on-the-air",
			"hidden-gem-series",
			"popular-tv-shows",
		]);
	});
});

describe("sectionQuery", () => {
	it("narrows discover sections to the genre and requests the page", async () => {
		await fetchPage(sectionQuery("hidden-gems", horror), 2);

		expect(discoverMedia).toHaveBeenCalledWith({
			data: {
				mediaType: "movie",
				params: expect.objectContaining({ with_genres: "27", page: 2 }),
			},
		});
	});

	it("uses TMDB's top rated list when unfiltered", async () => {
		await fetchPage(sectionQuery("top-rated"), 3);

		expect(getMediaList).toHaveBeenCalledWith({
			data: { mediaType: "movie", list: "top_rated", page: 3 },
		});
		expect(discoverMedia).not.toHaveBeenCalled();
	});

	it("pages through trending", async () => {
		await fetchPage(sectionQuery("trending"), 4);

		expect(getTrendingMedia).toHaveBeenCalledWith({
			data: { mediaType: "movie", time_window: "week", page: 4 },
		});
	});

	it("loads TV lists for TV sections", async () => {
		await fetchPage(sectionQuery("on-the-air"), 1);

		expect(getMediaList).toHaveBeenCalledWith({
			data: { mediaType: "tv", list: "on_the_air", page: 1 },
		});
	});

	it("narrows TV sections with the genre's TV ids", async () => {
		await fetchPage(sectionQuery("top-rated-tv-shows", crime), 1);

		expect(discoverMedia).toHaveBeenCalledWith({
			data: {
				mediaType: "tv",
				params: expect.objectContaining({ with_genres: "80", page: 1 }),
			},
		});
		expect(getMediaList).not.toHaveBeenCalled();
	});

	it("stops after the last page", () => {
		const { getNextPageParam } = sectionQuery("popular");
		const page = { page: 3, total_pages: 3, total_results: 60, results: [] };

		expect(getNextPageParam(page, [page], 3, [3])).toBeUndefined();
		expect(getNextPageParam({ ...page, page: 1 }, [page], 1, [1])).toBe(2);
	});
});
