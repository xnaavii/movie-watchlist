import { describe, expect, it } from "vitest";
import {
	DISCOVER_GENRES,
	findDiscoverGenre,
	findDiscoverGenreById,
	listDiscoverGenres,
	toWithGenres,
} from "./genres";

describe("findDiscoverGenre", () => {
	it("finds a genre by slug", () => {
		expect(findDiscoverGenre("science-fiction")).toMatchObject({
			name: "Science Fiction",
			ids: { movie: [878], tv: [10765] },
		});
	});

	it("finds legacy numeric links by movie genre id", () => {
		expect(findDiscoverGenre("28")?.slug).toBe("action");
	});

	it("falls back to TV genre ids", () => {
		expect(findDiscoverGenre("10764")?.slug).toBe("reality");
	});

	it("rejects unknown genres", () => {
		expect(findDiscoverGenre("news")).toBeUndefined();
		expect(findDiscoverGenre("99999")).toBeUndefined();
	});
});

describe("findDiscoverGenreById", () => {
	it("opens TV's merged genres on their first movie counterpart", () => {
		expect(findDiscoverGenreById(10759)?.slug).toBe("action");
		expect(findDiscoverGenreById(10768)?.slug).toBe("war");
	});
});

describe("listDiscoverGenres", () => {
	it("keeps only genres with titles of the type", () => {
		const tv = listDiscoverGenres("tv").map((genre) => genre.slug);

		expect(tv).toContain("kids");
		expect(tv).not.toContain("horror");
		expect(
			listDiscoverGenres("movie").map((genre) => genre.slug),
		).not.toContain("kids");
	});

	it("lists every genre for both types", () => {
		expect(listDiscoverGenres()).toBe(DISCOVER_GENRES);
	});

	it("has unique slugs", () => {
		const slugs = DISCOVER_GENRES.map((genre) => genre.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});
});

describe("toWithGenres", () => {
	it("joins ids so any of them matches", () => {
		// biome-ignore lint/style/noNonNullAssertion: Science Fiction is in the list
		const sciFi = findDiscoverGenre("science-fiction")!;
		expect(toWithGenres(sciFi, "tv")).toBe("10765");
		expect(toWithGenres(sciFi, "movie")).toBe("878");
	});
});
