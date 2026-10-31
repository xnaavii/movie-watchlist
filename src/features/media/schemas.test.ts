import { describe, expect, it } from "vitest";
import {
	imdbIdRequestSchema,
	mediaDiscoverRequestSchema,
	mediaListRequestSchema,
	mediaLogosRequestSchema,
	mediaRefSchema,
	searchRequestSchema,
} from "./schemas";

describe("media server function inputs", () => {
	it("keeps only the ref from a whole media item", () => {
		expect(
			mediaRefSchema.parse({ mediaType: "tv", id: 1399, title: "Got" }),
		).toEqual({ mediaType: "tv", id: 1399 });
	});

	it("rejects unknown media types and bad ids", () => {
		expect(() => mediaRefSchema.parse({ mediaType: "game", id: 1 })).toThrow();
		expect(() =>
			mediaRefSchema.parse({ mediaType: "movie", id: -1 }),
		).toThrow();
		expect(() =>
			mediaRefSchema.parse({ mediaType: "movie", id: "1" }),
		).toThrow();
	});

	it("only allows lists that exist for the media type", () => {
		expect(
			mediaListRequestSchema.parse({ mediaType: "tv", list: "airing_today" }),
		).toEqual({ mediaType: "tv", list: "airing_today" });
		expect(() =>
			mediaListRequestSchema.parse({
				mediaType: "movie",
				list: "airing_today",
			}),
		).toThrow();
		expect(() =>
			mediaListRequestSchema.parse({
				mediaType: "movie",
				list: "popular",
				page: 0,
			}),
		).toThrow();
	});

	it("caps logos at one row", () => {
		const refs = Array.from({ length: 40 }, (_, i) => ({
			mediaType: "movie" as const,
			id: i + 1,
		}));
		expect(mediaLogosRequestSchema.parse(refs)).toHaveLength(24);
	});

	it("accepts flat discover filters only", () => {
		expect(
			mediaDiscoverRequestSchema.parse({
				mediaType: "movie",
				params: { with_genres: "28", page: 2, include_adult: false },
			}).params,
		).toEqual({ with_genres: "28", page: 2, include_adult: false });
		expect(() =>
			mediaDiscoverRequestSchema.parse({
				mediaType: "movie",
				params: { with_genres: { $gt: 1 } },
			}),
		).toThrow();
	});

	it("rejects empty searches and malformed IMDb ids", () => {
		expect(() => searchRequestSchema.parse({ query: "   " })).toThrow();
		expect(searchRequestSchema.parse({ query: " dune " }).query).toBe("dune");
		expect(() => imdbIdRequestSchema.parse({ imdbId: "../etc" })).toThrow();
		expect(imdbIdRequestSchema.parse({ imdbId: "tt0111161" })).toEqual({
			imdbId: "tt0111161",
		});
	});
});
