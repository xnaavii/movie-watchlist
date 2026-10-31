import { beforeEach, describe, expect, it } from "vitest";
import {
	clearGuestEntries,
	getGuestMediaByGenre,
	getGuestStatus,
	getGuestStatuses,
	getGuestWatchlistPage,
	readGuestEntries,
	removeGuestEntry,
	saveGuestEntry,
} from "./guestWatchlist";

const dune = {
	mediaType: "movie" as const,
	id: 693134,
	title: "Dune: Part Two",
	posterPath: "/dune.jpg",
	releaseDate: "2024-02-27",
	genres: [{ id: 878, name: "Science Fiction" }],
};
const severance = {
	mediaType: "tv" as const,
	id: 95396,
	title: "Severance",
	releaseDate: "2022-02-17",
	genreIds: [18, 10765],
};
const alien = {
	mediaType: "movie" as const,
	id: 348,
	title: "Alien",
	releaseDate: "1979-05-25",
	genreIds: [27, 878],
};

beforeEach(() => {
	clearGuestEntries();
});

describe("guest watchlist", () => {
	it("saves, updates and removes titles", () => {
		saveGuestEntry(dune);
		expect(getGuestStatus(dune)).toBe("want_to_watch");

		saveGuestEntry(dune, "watched");
		expect(getGuestStatus(dune)).toBe("watched");
		expect(readGuestEntries()).toHaveLength(1);
		expect(readGuestEntries()[0]?.watchedAt).not.toBeNull();

		removeGuestEntry(dune);
		expect(getGuestStatus(dune)).toBeNull();
		expect(readGuestEntries()).toEqual([]);
	});

	it("keeps movies and shows with the same id apart", () => {
		saveGuestEntry({ ...dune, id: 1 });
		saveGuestEntry({ ...severance, id: 1 }, "watched");
		expect(getGuestStatuses()).toEqual({
			"movie:1": "want_to_watch",
			"tv:1": "watched",
		});
	});

	it("stores genre ids from details pages too", () => {
		saveGuestEntry(dune);
		expect(readGuestEntries()[0]?.media.genreIds).toEqual([878]);
	});

	it("pages and filters like the server", () => {
		saveGuestEntry(alien, "watched", new Date("2026-01-01"));
		saveGuestEntry(dune, "want_to_watch", new Date("2026-01-02"));
		saveGuestEntry(severance, "want_to_watch", new Date("2026-01-03"));

		const newestFirst = getGuestWatchlistPage(1);
		expect(newestFirst.results.map((r) => r.media.title)).toEqual([
			"Severance",
			"Dune: Part Two",
			"Alien",
		]);
		expect(newestFirst.hasMore).toBe(false);

		expect(
			getGuestWatchlistPage(1, { type: "movie", sort: "oldest" }).results.map(
				(r) => r.media.title,
			),
		).toEqual(["Alien", "Dune: Part Two"]);
		expect(
			getGuestWatchlistPage(1, { status: "watched" }).results,
		).toHaveLength(1);
		expect(
			getGuestWatchlistPage(1, { genre: 878, from: 2000 }).results,
		).toEqual([
			{
				status: "want_to_watch",
				media: expect.objectContaining({ id: 693134 }),
			},
		]);

		const firstPage = getGuestWatchlistPage(1, {}, 2);
		expect(firstPage.hasMore).toBe(true);
		expect(getGuestWatchlistPage(2, {}, 2).results).toHaveLength(1);
	});

	it("finds titles in a discover genre across both types", () => {
		saveGuestEntry(dune);
		saveGuestEntry(severance);
		saveGuestEntry({ ...alien, genreIds: [27] });
		const sciFi = getGuestMediaByGenre({ movie: [878], tv: [10765] });
		expect(sciFi.map((m) => m.title).sort()).toEqual([
			"Dune: Part Two",
			"Severance",
		]);
	});

	it("ignores storage it can't read", () => {
		localStorage.setItem("watchlist:guest", "not json");
		expect(readGuestEntries()).toEqual([]);
	});
});
