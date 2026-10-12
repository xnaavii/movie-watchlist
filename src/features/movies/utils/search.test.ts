import type { MovieResultItem, PersonResultItem } from "@lorenzopant/tmdb";
import { describe, expect, it } from "vitest";
import {
	buildFallbackQueries,
	isPersonMatch,
	normalizeText,
	parseSearchQuery,
	rankFuzzyResults,
	rankSearchResults,
	titleSimilarity,
} from "./search";

function movie(
	id: number,
	title: string,
	popularity = 1,
	original_title = title,
): MovieResultItem {
	return {
		id,
		title,
		original_title,
		popularity,
		overview: "",
		adult: false,
		original_language: "en",
		genre_ids: [],
		softcore: false,
		release_date: "",
		video: false,
		vote_average: 0,
		vote_count: 0,
	};
}

function person(name: string, known_for_department = "Acting") {
	return { name, known_for_department } as PersonResultItem;
}

describe("normalizeText", () => {
	it("ignores case, accents and punctuation", () => {
		expect(normalizeText("  Amélie: Le Fabuleux!! ")).toBe(
			"amelie le fabuleux",
		);
		expect(normalizeText("Spider-Man")).toBe("spider man");
	});
});

describe("parseSearchQuery", () => {
	it("splits a trailing year off the title", () => {
		expect(parseSearchQuery("dune 2021")).toEqual({
			title: "dune",
			year: "2021",
		});
		expect(parseSearchQuery("Dune (1984)")).toEqual({
			title: "Dune",
			year: "1984",
		});
	});

	it("keeps a title that is only a year", () => {
		expect(parseSearchQuery("1917")).toEqual({ title: "1917" });
	});

	it("collapses extra whitespace", () => {
		expect(parseSearchQuery("  the   matrix ")).toEqual({
			title: "the matrix",
		});
	});
});

describe("titleSimilarity", () => {
	it("scores a misspelling close to the real title", () => {
		expect(titleSimilarity("intersteller", "Interstellar")).toBeGreaterThan(
			0.9,
		);
	});

	it("matches a word inside a longer title", () => {
		expect(titleSimilarity("rings", "The Lord of the Rings")).toBeGreaterThan(
			0.9,
		);
	});

	it("matches titles typed without spaces or hyphens", () => {
		expect(titleSimilarity("spiderman", "Spider-Man")).toBe(1);
	});

	it("scores unrelated titles low", () => {
		expect(titleSimilarity("intersteller", "Toy Story")).toBeLessThan(0.5);
	});
});

describe("rankSearchResults", () => {
	it("puts exact title matches first, most popular first", () => {
		const results = [
			movie(1, "Dune: Part Two", 50),
			movie(2, "Dune", 10),
			movie(3, "Dune", 80),
			movie(4, "Jodorowsky's Dune", 5),
		];
		expect(rankSearchResults("dune", results).map((m) => m.id)).toEqual([
			3, 2, 1, 4,
		]);
	});

	it("matches on the original title too", () => {
		const results = [movie(1, "Other", 1), movie(2, "Spirited Away", 1, "Sen")];
		expect(rankSearchResults("sen", results)[0].id).toBe(2);
	});
});

describe("rankFuzzyResults", () => {
	it("orders loose matches by how close the title is", () => {
		const results = [
			movie(1, "Interstate 60", 30),
			movie(2, "Interstellar", 20),
		];
		expect(rankFuzzyResults("intersteller", results)[0].id).toBe(2);
	});
});

describe("buildFallbackQueries", () => {
	it("trims the end of a misspelt word", () => {
		const queries = buildFallbackQueries("intersteller");
		expect(queries).toContain("intersteller".slice(0, 10));
		expect(queries.every((q) => q.length >= 3)).toBe(true);
	});

	it("drops punctuation first", () => {
		expect(buildFallbackQueries("spider-man!")[0]).toBe("spider man");
	});

	it("never exceeds four extra searches", () => {
		expect(
			buildFallbackQueries("the extraordinarily long misspeltword").length,
		).toBeLessThanOrEqual(4);
	});
});

describe("isPersonMatch", () => {
	it("matches a full or partial name", () => {
		expect(isPersonMatch("tom hanks", person("Tom Hanks"))).toBe(true);
		expect(
			isPersonMatch("nolan", person("Christopher Nolan", "Directing")),
		).toBe(true);
		expect(isPersonMatch("tom hnaks", person("Tom Hanks"))).toBe(false);
		expect(isPersonMatch("tom hankss", person("Tom Hanks"))).toBe(true);
	});

	it("ignores titles that are not a name", () => {
		expect(isPersonMatch("the matrix", person("Tom Hanks"))).toBe(false);
	});

	it("ignores very short queries and non-creative roles", () => {
		expect(isPersonMatch("tom", person("Tom Hanks"))).toBe(false);
		expect(isPersonMatch("tom hanks", person("Tom Hanks", "Production"))).toBe(
			false,
		);
	});
});
