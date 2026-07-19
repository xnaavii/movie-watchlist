import { describe, expect, it } from "vitest";
import { buildDiscoverParams } from "./utils";

describe("buildDiscoverParams", () => {
	it("defaults to popularity sort with no filters", () => {
		const params = buildDiscoverParams({});
		expect(params.sort_by).toBe("popularity.desc");
	});

	it("does not force popularity sort when a filter is active", () => {
		const params = buildDiscoverParams({ genreId: 28 });
		expect(params.sort_by).toBeUndefined();
	});

	it("applies a vote count floor when sorting by rating", () => {
		const params = buildDiscoverParams({ sortBy: "vote_average.desc" });
		expect(params["vote_count.gte"]).toBeGreaterThan(0);
	});
});
