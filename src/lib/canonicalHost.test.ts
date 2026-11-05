import { describe, expect, it } from "vitest";
import { canonicalRedirectUrl } from "#/lib/canonicalHost";

describe("canonicalRedirectUrl", () => {
	it("sends the workers.dev address to the live domain, keeping path and query", () => {
		expect(
			canonicalRedirectUrl(
				"https://movie-watchlist.petrovic-valpovo.workers.dev/auth/login?redirect=%2Fwatchlist",
			),
		).toBe("https://watchlist.ipetrovic.com/auth/login?redirect=%2Fwatchlist");
	});

	it("sends the old domain to the live domain", () => {
		expect(
			canonicalRedirectUrl("https://watchlist.xnaavii.com/movies/1-dune"),
		).toBe("https://watchlist.ipetrovic.com/movies/1-dune");
	});

	it.each([
		"https://watchlist.ipetrovic.com/discover",
		"https://abc123-movie-watchlist.petrovic-valpovo.workers.dev/discover",
		"http://localhost:3000/discover",
	])("leaves %s alone", (url) => {
		expect(canonicalRedirectUrl(url)).toBeNull();
	});
});
