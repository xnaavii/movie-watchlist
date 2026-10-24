import { describe, expect, it } from "vitest";
import { buildDiscoverParams, normalizeReview } from "./utils";
import { formatReviewDate, stripMarkdown } from "./utils/format";

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
