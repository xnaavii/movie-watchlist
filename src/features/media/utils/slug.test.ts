import { describe, expect, it } from "vitest";
import { parseMediaSlug, slugify, toMediaPath, toMediaSlug } from "./slug";

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

describe("toMediaSlug", () => {
	it("prefixes the title slug with the movie id", () => {
		expect(toMediaSlug({ id: 550, title: "Fight Club" })).toBe(
			"550-fight-club",
		);
	});

	it("falls back to the id when the title has no latin characters", () => {
		expect(toMediaSlug({ id: 12, title: "千と千尋の神隠し" })).toBe("12");
	});
});

describe("parseMediaSlug", () => {
	it("reads the id from a full slug", () => {
		expect(parseMediaSlug("550-fight-club")).toBe(550);
	});

	it("reads a legacy id-only url", () => {
		expect(parseMediaSlug("550")).toBe(550);
	});

	it("rejects slugs without a leading id", () => {
		expect(parseMediaSlug("fight-club")).toBeNull();
		expect(parseMediaSlug("550abc")).toBeNull();
	});
});

describe("toMediaPath", () => {
	it("builds movie and TV paths", () => {
		expect(
			toMediaPath({ mediaType: "movie", id: 550, title: "Fight Club" }),
		).toBe("/movies/550-fight-club");
		expect(
			toMediaPath({ mediaType: "tv", id: 1399, title: "Game of Thrones" }),
		).toBe("/tv/1399-game-of-thrones");
	});

	it("round-trips the id through the slug", () => {
		for (const title of [
			"Amélie",
			"Tom & Jerry",
			"千と千尋の神隠し",
			"9-1-1",
		]) {
			expect(parseMediaSlug(toMediaSlug({ id: 42, title }))).toBe(42);
		}
	});
});
