import { describe, expect, it } from "vitest";
import {
	buildProfileStats,
	formatRelativeTime,
	formatWatchTime,
	type StatsEntry,
	type StatsGenreLink,
} from "./stats";

const entry = (overrides: Partial<StatsEntry>): StatsEntry => ({
	id: 1,
	mediaType: "movie",
	title: "Movie",
	posterPath: null,
	releaseDate: null,
	runtime: 100,
	voteAverage: 7,
	status: "want_to_watch",
	addedAt: new Date("2026-10-01T00:00:00Z"),
	watchedAt: null,
	...overrides,
});

describe("buildProfileStats", () => {
	const entries = [
		entry({
			id: 1,
			status: "watched",
			runtime: 120,
			voteAverage: 8,
			watchedAt: new Date("2026-10-20T00:00:00Z"),
		}),
		entry({ id: 2, status: "watched", runtime: null, voteAverage: null }),
		entry({
			id: 3,
			runtime: 90,
			addedAt: new Date("2026-10-22T00:00:00Z"),
		}),
	];
	const genres: StatsGenreLink[] = [
		{ id: 1, mediaType: "movie", genreId: 28, name: "Action" },
		{ id: 2, mediaType: "movie", genreId: 28, name: "Action" },
		{ id: 3, mediaType: "movie", genreId: 18, name: "Drama" },
		{ id: 99, mediaType: "movie", genreId: 35, name: "Comedy" },
	];
	const stats = buildProfileStats(entries, genres);

	it("counts watched and want to watch", () => {
		expect(stats).toMatchObject({ total: 3, watched: 2, wantToWatch: 1 });
	});

	it("sums runtimes and flags watched movies without one", () => {
		expect(stats.watchedMinutes).toBe(120);
		expect(stats.remainingMinutes).toBe(90);
		expect(stats.watchedMissingRuntime).toBe(1);
	});

	it("averages known scores of watched movies only", () => {
		expect(stats.averageScore).toBe(8);
	});

	it("ranks genres by watched count and ignores movies not on the list", () => {
		expect(stats.genres).toEqual([
			{ id: 28, name: "Action", watched: 2, saved: 2 },
			{ id: 18, name: "Drama", watched: 0, saved: 1 },
		]);
	});

	it("orders activity newest first, using the watched date for watched movies", () => {
		expect(stats.recent.map((r) => [r.id, r.action])).toEqual([
			[3, "added"],
			[1, "watched"],
			[2, "watched"],
		]);
	});

	it("keeps a movie and a TV show with the same TMDB id apart", () => {
		const mixed = buildProfileStats(
			[
				entry({ id: 7, mediaType: "movie", status: "want_to_watch" }),
				entry({ id: 7, mediaType: "tv", status: "watched" }),
			],
			[
				{ id: 7, mediaType: "movie", genreId: 28, name: "Action" },
				{ id: 7, mediaType: "tv", genreId: 18, name: "Drama" },
			],
		);
		expect(mixed.genres).toEqual([
			{ id: 18, name: "Drama", watched: 1, saved: 1 },
			{ id: 28, name: "Action", watched: 0, saved: 1 },
		]);
	});

	it("returns no score for an empty list", () => {
		expect(buildProfileStats([], []).averageScore).toBeNull();
	});
});

describe("formatWatchTime", () => {
	it.each([
		[0, "0h"],
		[45, "45m"],
		[120, "2h"],
		[135, "2h 15m"],
		[1440, "1d"],
		[1560, "1d 2h"],
	])("%i minutes -> %s", (minutes, expected) => {
		expect(formatWatchTime(minutes)).toBe(expected);
	});
});

describe("formatRelativeTime", () => {
	const now = new Date("2026-10-23T12:00:00Z");
	it("formats past dates", () => {
		expect(formatRelativeTime(new Date("2026-10-23T11:59:30Z"), now)).toBe(
			"just now",
		);
		expect(formatRelativeTime(new Date("2026-10-22T12:00:00Z"), now)).toBe(
			"yesterday",
		);
		expect(formatRelativeTime(new Date("2026-10-20T12:00:00Z"), now)).toBe(
			"3 days ago",
		);
	});
});
