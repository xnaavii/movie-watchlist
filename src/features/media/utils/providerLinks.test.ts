import { describe, expect, it } from "vitest";
import { toJustWatchSearchUrl, toProviderUrl } from "./providerLinks";

const provider = (provider_id: number, provider_name = "") => ({
	provider_id,
	provider_name,
});

describe("toProviderUrl", () => {
	it("searches the provider's own site", () => {
		expect(toProviderUrl(provider(8), "The Dark Knight", "IE")).toBe(
			"https://www.netflix.com/search?q=The%20Dark%20Knight",
		);
	});

	it("uses the region's version of the site", () => {
		expect(toProviderUrl(provider(2), "Dune", "GB")).toBe(
			"https://tv.apple.com/gb/search?term=Dune",
		);
		expect(toProviderUrl(provider(35), "Dune", "GB")).toBe(
			"https://www.rakuten.tv/uk",
		);
		expect(toProviderUrl(provider(3), "Dune", "IE")).toBe(
			"https://play.google.com/store/search?q=Dune&c=movies&gl=IE",
		);
	});

	it("sends Amazon and Apple channels to those stores", () => {
		expect(
			toProviderUrl(provider(9999, "MGM+ Amazon Channel"), "Dune", "US"),
		).toBe("https://www.primevideo.com/search?phrase=Dune");
	});

	it("falls back to JustWatch for unknown providers", () => {
		expect(toProviderUrl(provider(9999, "Somewhere"), "Dune", "GB")).toBe(
			"https://www.justwatch.com/uk/search?q=Dune",
		);
		expect(toJustWatchSearchUrl("Dune", "IE")).toBe(
			"https://www.justwatch.com/ie/search?q=Dune",
		);
	});
});
