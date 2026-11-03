import { describe, expect, it } from "vitest";
import {
	buildDiscoverParams,
	isReleased,
	normalizeReview,
	pickWideReleaseDate,
} from ".";
import { formatReviewDate, stripMarkdown } from "./format";

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

describe("normalizeReview", () => {
	const review = {
		id: "abc",
		author: "username",
		author_details: {
			name: "Jane Doe",
			username: "username",
			avatar_path: "https://image.tmdb.org/t/p/original/avatar.jpg",
			rating: 8,
		},
		content: "Great movie",
		created_at: "2018-06-09T17:51:53.359Z",
		updated_at: "2018-06-09T17:51:53.359Z",
		url: "https://www.themoviedb.org/review/abc",
	};

	it("prefers the author's display name and resizes the avatar", () => {
		const normalized = normalizeReview(review);
		expect(normalized.authorName).toBe("Jane Doe");
		expect(normalized.avatarSrc).toBe(
			"https://image.tmdb.org/t/p/w185/avatar.jpg",
		);
	});

	it("falls back to the username when there is no display name", () => {
		const normalized = normalizeReview({
			...review,
			author_details: { ...review.author_details, name: "" },
		});
		expect(normalized.authorName).toBe("username");
	});
});

describe("formatReviewDate", () => {
	it("formats in UTC regardless of local timezone", () => {
		expect(formatReviewDate("2018-06-09T23:30:00.000Z")).toBe("Jun 9, 2018");
	});
});

describe("stripMarkdown", () => {
	it("removes emphasis, links and headings", () => {
		expect(
			stripMarkdown("## Title\n**Bold** and [a link](https://x.com)"),
		).toBe("Title\nBold and a link");
	});
});

describe("isReleased", () => {
	const today = new Date("2026-10-24T12:00:00Z");

	it("counts a title released today or earlier", () => {
		expect(
			isReleased({ mediaType: "movie", releaseDate: "2026-10-24" }, today),
		).toBe(true);
		expect(
			isReleased({ mediaType: "tv", releaseDate: "2019-03-01" }, today),
		).toBe(true);
	});

	it("does not count a title that comes out later", () => {
		expect(
			isReleased(
				{
					mediaType: "movie",
					releaseDate: "2026-12-18",
					status: "Post Production",
				},
				today,
			),
		).toBe(false);
		expect(
			isReleased({ mediaType: "tv", releaseDate: "2027-01-05" }, today),
		).toBe(false);
	});

	it("waits for a movie's wide release, not its festival premiere", () => {
		const premiered = {
			mediaType: "movie" as const,
			releaseDate: "2026-09-02",
			status: "Released",
		};
		expect(
			isReleased({ ...premiered, wideReleaseDate: "2026-12-18" }, today),
		).toBe(false);
		expect(isReleased({ ...premiered, wideReleaseDate: null }, today)).toBe(
			false,
		);
		expect(
			isReleased({ ...premiered, wideReleaseDate: "2026-10-01" }, today),
		).toBe(true);
	});

	it("falls back to the TMDB status when there is no date", () => {
		expect(isReleased({ mediaType: "movie", status: "Released" }, today)).toBe(
			true,
		);
		expect(isReleased({ mediaType: "movie", status: "Planned" }, today)).toBe(
			false,
		);
		expect(
			isReleased(
				{ mediaType: "tv", releaseDate: "", status: "In Production" },
				today,
			),
		).toBe(false);
	});
});

describe("pickWideReleaseDate", () => {
	const release = (type: number, release_date: string) => ({
		type,
		release_date,
		certification: "",
		iso_639_1: "",
		note: "",
		descriptors: [],
	});

	it("picks the earliest cinema or home release in any country", () => {
		expect(
			pickWideReleaseDate({
				results: [
					{
						iso_3166_1: "US",
						release_dates: [
							release(1, "2026-09-02T00:00:00.000Z"),
							release(3, "2026-11-21T00:00:00.000Z"),
						],
					},
					{
						iso_3166_1: "IE",
						release_dates: [release(3, "2026-11-14T00:00:00.000Z")],
					},
				],
			}),
		).toBe("2026-11-14");
	});

	it("ignores premieres and limited runs", () => {
		expect(
			pickWideReleaseDate({
				results: [
					{
						iso_3166_1: "IT",
						release_dates: [
							release(1, "2026-09-02T00:00:00.000Z"),
							release(2, "2026-09-20T00:00:00.000Z"),
						],
					},
				],
			}),
		).toBeNull();
	});
});
