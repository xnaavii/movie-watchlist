import type { MovieReleaseDateResult } from "@lorenzopant/tmdb";
import { describe, expect, it } from "vitest";
import { parseDiscFormats, pickDiscReleases } from "./discReleases";

const release = (type: number, date: string, note = "") => ({
	certification: "",
	iso_639_1: "",
	release_date: `${date}T00:00:00.000Z`,
	type,
	note,
	descriptors: [],
});

describe("parseDiscFormats", () => {
	it("reads formats from TMDB notes, best first", () => {
		expect(parseDiscFormats("DVD & Blu-ray")).toEqual(["bluray", "dvd"]);
		expect(parseDiscFormats("4K Ultra HD Blu-ray")).toEqual(["uhd"]);
		expect(parseDiscFormats("UHD + Blu-ray + Digital")).toEqual([
			"uhd",
			"bluray",
		]);
		expect(parseDiscFormats("4K UHD / Bluray / DVD")).toEqual([
			"uhd",
			"bluray",
			"dvd",
		]);
	});

	it("returns nothing for empty or unrelated notes", () => {
		expect(parseDiscFormats("")).toEqual([]);
		expect(parseDiscFormats("Steelbook")).toEqual([]);
	});
});

describe("pickDiscReleases", () => {
	const results: MovieReleaseDateResult[] = [
		{
			iso_3166_1: "US",
			release_dates: [
				release(3, "2024-03-01"),
				release(5, "2024-05-14", "4K UHD"),
			],
		},
		{
			iso_3166_1: "IE",
			release_dates: [
				release(5, "2024-07-01", "DVD"),
				release(5, "2024-06-10"),
				release(4, "2024-04-16"),
			],
		},
		{ iso_3166_1: "FR", release_dates: [release(5, "2024-01-01", "DVD")] },
	];

	it("keeps physical releases in the shown regions, in region then date order", () => {
		expect(pickDiscReleases(results)).toEqual({
			releases: [
				{ region: "IE", date: "2024-06-10", formats: [] },
				{ region: "IE", date: "2024-07-01", formats: ["dvd"] },
				{ region: "US", date: "2024-05-14", formats: ["uhd"] },
			],
			formats: ["uhd", "dvd"],
		});
	});

	it("returns null without physical releases", () => {
		expect(pickDiscReleases([])).toBeNull();
		expect(pickDiscReleases(results, ["GB"])).toBeNull();
	});
});
