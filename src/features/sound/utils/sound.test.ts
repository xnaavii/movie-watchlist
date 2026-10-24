import { describe, expect, it } from "vitest";
import { ATMOS_SEED, toSeedKey } from "../seed";
import type { AtmosShowcaseItem } from "../types";
import {
	EMPTY_SOUND,
	isAtmosTitle,
	matchSeedResult,
	SCORE_PRIOR_MEAN,
	sortShowcase,
	soundScore,
} from "./sound";

describe("soundScore", () => {
	it("starts unrated titles at the prior", () => {
		expect(soundScore(EMPTY_SOUND)).toBe(SCORE_PRIOR_MEAN);
	});

	it("ranks many strong ratings above a single perfect one", () => {
		const single = soundScore({ count: 1, overall: 10 });
		const many = soundScore({ count: 50, overall: 9 });
		expect(many).toBeGreaterThan(single);
	});

	it("moves toward the average as ratings grow", () => {
		expect(soundScore({ count: 1000, overall: 4 })).toBeCloseTo(4, 1);
	});
});

describe("isAtmosTitle", () => {
	it("trusts curated titles unless clearly outvoted", () => {
		expect(isAtmosTitle({ curated: true, yes: 0, no: 0 })).toBe(true);
		expect(isAtmosTitle({ curated: true, yes: 0, no: 2 })).toBe(true);
		expect(isAtmosTitle({ curated: true, yes: 1, no: 4 })).toBe(false);
	});

	it("needs more yes than no votes for community titles", () => {
		expect(isAtmosTitle({ curated: false, yes: 0, no: 0 })).toBe(false);
		expect(isAtmosTitle({ curated: false, yes: 1, no: 1 })).toBe(false);
		expect(isAtmosTitle({ curated: false, yes: 2, no: 1 })).toBe(true);
	});
});

describe("matchSeedResult", () => {
	const results = [
		{ id: 1, title: "Dune", release_date: "1984-12-14" },
		{ id: 2, title: "Dune", release_date: "2021-09-15" },
		{ id: 3, title: "Dune: Part Two", release_date: "2024-02-27" },
	];

	it("prefers the exact title in the right year", () => {
		expect(matchSeedResult({ title: "Dune", year: 2021 }, results)?.id).toBe(2);
	});

	it("ignores punctuation and case", () => {
		expect(
			matchSeedResult({ title: "dune part two", year: 2024 }, results)?.id,
		).toBe(3);
	});

	it("matches series by name and first air date", () => {
		const shows = [
			{ id: 10, name: "Shōgun", first_air_date: "1980-09-15" },
			{ id: 11, name: "Shōgun", first_air_date: "2024-02-27" },
		];
		expect(matchSeedResult({ title: "Shōgun", year: 2024 }, shows)?.id).toBe(
			11,
		);
	});

	it("returns undefined when nothing fits", () => {
		expect(
			matchSeedResult({ title: "Arrival", year: 2016 }, [
				{ id: 9, title: "Departure", release_date: "2001-01-01" },
			]),
		).toBeUndefined();
	});
});

describe("sortShowcase", () => {
	const item = (tmdbId: number, score: number, count: number) =>
		({
			tmdbId,
			mediaType: "movie",
			score,
			sound: { ...EMPTY_SOUND, count },
		}) as AtmosShowcaseItem;

	it("sorts by score, then by number of ratings", () => {
		const sorted = sortShowcase([
			item(1, 7, 0),
			item(2, 8.5, 3),
			item(3, 7, 4),
		]);
		expect(sorted.map((i) => i.tmdbId)).toEqual([2, 3, 1]);
	});
});

describe("ATMOS_SEED", () => {
	it("has unique keys", () => {
		const keys = ATMOS_SEED.map(toSeedKey);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it("covers both movies and series", () => {
		expect(ATMOS_SEED.some((s) => s.mediaType === "movie")).toBe(true);
		expect(ATMOS_SEED.some((s) => s.mediaType === "tv")).toBe(true);
	});
});
