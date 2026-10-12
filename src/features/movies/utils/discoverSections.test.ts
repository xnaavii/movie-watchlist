import { describe, expect, it } from "vitest";
import { buildComingSoonParams } from "./discoverSections";

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
