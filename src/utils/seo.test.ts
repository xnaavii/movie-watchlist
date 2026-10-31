import { describe, expect, it } from "vitest";
import { seo, truncateForMeta, truncateTitle } from "./seo";

describe("seo", () => {
	it("always sets the title and descriptions for search and social", () => {
		const tags = seo({ title: "Dune | Watchlist", description: "Sand." });
		expect(tags).toContainEqual({ title: "Dune | Watchlist" });
		expect(tags).toContainEqual({ name: "description", content: "Sand." });
		expect(tags).toContainEqual({
			property: "og:title",
			content: "Dune | Watchlist",
		});
		expect(tags).toContainEqual({
			name: "twitter:description",
			content: "Sand.",
		});
		expect(tags).toContainEqual({ property: "og:type", content: "website" });
	});

	it("adds url, image and alt text tags only when given", () => {
		const bare = seo({ title: "Watchlist" });
		expect(
			bare.some((tag) => "property" in tag && tag.property === "og:url"),
		).toBe(false);
		expect(
			bare.some((tag) => "name" in tag && tag.name === "twitter:card"),
		).toBe(false);

		const full = seo({
			title: "Dune",
			url: "https://watchlist.xnaavii.com/movies/1-dune",
			image: "https://image.tmdb.org/dune.jpg",
			imageAlt: "Dune poster",
			siteName: "Watchlist",
			type: "video.movie",
		});
		expect(full).toEqual(
			expect.arrayContaining([
				{
					property: "og:url",
					content: "https://watchlist.xnaavii.com/movies/1-dune",
				},
				{ property: "og:image", content: "https://image.tmdb.org/dune.jpg" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ property: "og:image:alt", content: "Dune poster" },
				{ property: "og:site_name", content: "Watchlist" },
				{ property: "og:type", content: "video.movie" },
			]),
		);
	});

	it("skips alt text without an image", () => {
		const tags = seo({ title: "Dune", imageAlt: "Dune poster" });
		expect(
			tags.some((tag) => "property" in tag && tag.property === "og:image:alt"),
		).toBe(false);
	});
});

describe("truncateForMeta", () => {
	it("keeps short text and trims long text with an ellipsis", () => {
		expect(truncateForMeta(undefined)).toBeUndefined();
		expect(truncateForMeta("Short.")).toBe("Short.");
		expect(truncateForMeta("one two three", 8)).toBe("one two…");
	});
});

describe("truncateTitle", () => {
	it("cuts long titles at the limit", () => {
		expect(truncateTitle("Dune")).toBe("Dune");
		expect(truncateTitle("a".repeat(50))).toBe(`${"a".repeat(40)}…`);
	});
});
