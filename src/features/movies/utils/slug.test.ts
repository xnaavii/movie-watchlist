import { describe, expect, it } from "vitest";
import {
	findGenreBySlug,
	parseMovieSlug,
	slugify,
	toGenreSlug,
	toMovieSlug,
} from "./slug";

describe("slugify", () => {
	it("lowercases and joins words with dashes", () => {
		expect(slugify("Fight Club")).toBe("fight-club");
	});

	it("strips accents, apostrophes and punctuation", () => {
		expect(slugify("Amélie")).toBe("amelie");
		expect(slugify("Schindler's List")).toBe("schindlers-list");
		expect(slugify("Star Wars: Episode IV – A New Hope")).toBe(
			"star-wars-episode-iv-a-new-hope",
		);
	});

	it("spells out ampersands", () => {
		expect(slugify("Action & Adventure")).toBe("action-and-adventure");
	});
});

describe("toMovieSlug", () => {
	it("prefixes the title slug with the movie id", () => {
		expect(toMovieSlug({ id: 550, title: "Fight Club" })).toBe(
			"550-fight-club",
		);
	});

	it("falls back to the id when the title has no latin characters", () => {
		expect(toMovieSlug({ id: 12, title: "千と千尋の神隠し" })).toBe("12");
	});
});

describe("parseMovieSlug", () => {
	it("reads the id from a full slug", () => {
		expect(parseMovieSlug("550-fight-club")).toBe(550);
	});

	it("reads a legacy id-only url", () => {
		expect(parseMovieSlug("550")).toBe(550);
	});

	it("rejects slugs without a leading id", () => {
		expect(parseMovieSlug("fight-club")).toBeNull();
		expect(parseMovieSlug("550abc")).toBeNull();
	});
});

describe("findGenreBySlug", () => {
	const genres = [
		{ id: 28, name: "Action" },
		{ id: 878, name: "Science Fiction" },
	];

	it("finds a genre by its readable slug", () => {
		expect(toGenreSlug(genres[1])).toBe("science-fiction");
		expect(findGenreBySlug(genres, "science-fiction")).toBe(genres[1]);
	});

	it("still finds a genre by its legacy numeric id", () => {
		expect(findGenreBySlug(genres, "28")).toBe(genres[0]);
	});

	it("returns undefined for unknown slugs", () => {
		expect(findGenreBySlug(genres, "western")).toBeUndefined();
	});
});
