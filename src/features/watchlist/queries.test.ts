import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetClientUser, setClientUser } from "#/lib/clientAuth";
import { clearGuestEntries, saveGuestEntry } from "./guest/guestWatchlist";

const server = vi.hoisted(() => ({
	getWatchlistStatusFn: vi.fn(),
	getWatchlistMediaByGenreFn: vi.fn(),
	getUserWatchlistPageFn: vi.fn(),
	getUserWatchlistStatusesFn: vi.fn(),
	getProfileStatsFn: vi.fn(),
}));

vi.mock("./server/watchlist.functions", () => server);

import { watchlistQueries } from "./queries";

const alien = {
	mediaType: "movie" as const,
	id: 348,
	title: "Alien",
	genreIds: [27, 878],
};

let queryClient: QueryClient;

beforeEach(() => {
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	resetClientUser();
	clearGuestEntries();
	for (const fn of Object.values(server)) fn.mockReset();
});

describe("watchlist queries for a guest", () => {
	beforeEach(() => {
		setClientUser(null);
		saveGuestEntry(alien, "watched");
	});

	it("read the device list without calling the server", async () => {
		await expect(
			queryClient.fetchQuery(watchlistQueries.status(alien)),
		).resolves.toBe("watched");
		await expect(
			queryClient.fetchQuery(watchlistQueries.watchlistStatuses()),
		).resolves.toEqual({ "movie:348": "watched" });

		const page = await queryClient.fetchQuery(watchlistQueries.list());
		expect(page.results).toEqual([
			{ status: "watched", media: expect.objectContaining({ id: 348 }) },
		]);

		for (const fn of Object.values(server)) expect(fn).not.toHaveBeenCalled();
	});

	it("page the device list like the server", async () => {
		const result = await queryClient.fetchInfiniteQuery(
			watchlistQueries.infiniteList({ status: "want_to_watch" }),
		);
		expect(result.pages[0]).toEqual({ results: [], page: 1, hasMore: false });
		expect(server.getUserWatchlistPageFn).not.toHaveBeenCalled();
	});

	it("find saved titles for a discover genre", async () => {
		const horror = await queryClient.fetchQuery(
			watchlistQueries.mediaByGenre("horror"),
		);
		expect(horror.map((item) => item.id)).toEqual([348]);
		await expect(
			queryClient.fetchQuery(watchlistQueries.mediaByGenre("no-such-genre")),
		).resolves.toEqual([]);
	});
});

describe("watchlist queries for a signed-in user", () => {
	beforeEach(() => setClientUser({ id: "user-1" }));

	it("ask the server, ignoring anything left on the device", async () => {
		saveGuestEntry(alien);
		server.getWatchlistStatusFn.mockResolvedValue(null);
		server.getWatchlistMediaByGenreFn.mockResolvedValue([]);
		server.getUserWatchlistPageFn.mockResolvedValue({
			results: [],
			page: 2,
			hasMore: false,
		});

		await expect(
			queryClient.fetchQuery(watchlistQueries.status(alien)),
		).resolves.toBeNull();
		expect(server.getWatchlistStatusFn).toHaveBeenCalledWith({
			data: { mediaType: "movie", id: 348 },
		});

		await queryClient.fetchQuery(watchlistQueries.mediaByGenre("horror"));
		expect(server.getWatchlistMediaByGenreFn).toHaveBeenCalledWith({
			data: { genreSlug: "horror" },
		});

		const filters = { status: "watched" as const };
		await queryClient.fetchInfiniteQuery(
			watchlistQueries.infiniteList(filters),
		);
		expect(server.getUserWatchlistPageFn).toHaveBeenCalledWith({
			data: { page: 1, filters },
		});
	});
});

describe("watchlist query keys", () => {
	it("all share the prefix that revalidation invalidates", () => {
		const keys = [
			watchlistQueries.status(alien).queryKey,
			watchlistQueries.mediaByGenre("horror").queryKey,
			watchlistQueries.list().queryKey,
			watchlistQueries.infiniteList().queryKey,
			watchlistQueries.stats().queryKey,
			watchlistQueries.watchlistStatuses().queryKey,
		];
		for (const key of keys) {
			expect(key.slice(0, 1)).toEqual([...watchlistQueries.allKey]);
		}
	});

	it("keep movies and shows with the same id apart", () => {
		expect(
			watchlistQueries.status({ mediaType: "movie", id: 1 }).queryKey,
		).not.toEqual(watchlistQueries.status({ mediaType: "tv", id: 1 }).queryKey);
	});

	it("stop paging when the last page says there's no more", () => {
		const { getNextPageParam } = watchlistQueries.infiniteList();
		const page = { results: [], page: 3, hasMore: true };
		expect(getNextPageParam(page as never, [], 3, [])).toBe(4);
		expect(
			getNextPageParam({ ...page, hasMore: false } as never, [], 3, []),
		).toBeUndefined();
	});
});
