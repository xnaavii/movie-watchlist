import { describe, expect, it } from "vitest";
import { toJustWatchSearchUrl, toProviderUrl } from "./providerLinks";

describe("toProviderUrl", () => {
	it("searches the provider's own site for known services", () => {
		expect(toProviderUrl(8, "The Dark Knight", "IE")).toBe(
			"https://www.netflix.com/search?q=The%20Dark%20Knight",
		);
		expect(toProviderUrl(2, "Dune", "US")).toBe(
			"https://tv.apple.com/search?term=Dune",
		);
	});

	it("falls back to JustWatch in the shown region", () => {
		expect(toProviderUrl(130, "Dune", "GB")).toBe(
			"https://www.justwatch.com/uk/search?q=Dune",
		);
		expect(toJustWatchSearchUrl("Dune", "IE")).toBe(
			"https://www.justwatch.com/ie/search?q=Dune",
		);
	});
});
