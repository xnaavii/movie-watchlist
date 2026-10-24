import { describe, expect, it } from "vitest";
import {
	buildComingSoonParams,
	buildNewReleasesParams,
	TOP_RATED_PARAMS,
	withGenre,
} from "./discoverSections";

describe("buildComingSoonParams", () => {
	it("only includes theatrical releases from tomorrow onward", () => {
		const params = buildComingSoonParams(new Date("2026-10-12T14:00:00Z"));

		expect(params["primary_release_date.gte"]).toBe("2026-10-13");
		expect(params.with_release_type).toBe("2|3");
	});

	it("rolls over to the next month and year", () => {
		const params = buildComingSoonParams(new Date("2026-12-31T23:30:00Z"));

		expect(params["primary_release_date.gte"]).toBe("2027-01-01");
	});
});

describe("buildNewReleasesParams", () => {
	it("covers the last three months up to today", () => {
		const params = buildNewReleasesParams(new Date("2026-10-23T12:00:00Z"));

		expect(params["primary_release_date.gte"]).toBe("2026-07-23");
		expect(params["primary_release_date.lte"]).toBe("2026-10-23");
	});
});

describe("withGenre", () => {
	it("adds the genre without changing the original params", () => {
		const params = withGenre(TOP_RATED_PARAMS, 878);

		expect(params.with_genres).toBe(878);
		expect(params.sort_by).toBe(TOP_RATED_PARAMS.sort_by);
		expect(TOP_RATED_PARAMS.with_genres).toBeUndefined();
	});
});
