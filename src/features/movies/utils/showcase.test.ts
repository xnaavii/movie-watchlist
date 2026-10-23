import type { ImageItem, MovieResultItem } from "@lorenzopant/tmdb";
import { describe, expect, it } from "vitest";
import {
	pickLogo,
	selectShowcaseCandidates,
	toShowcaseMovie,
} from "./showcase";

const movie = (overrides: Partial<MovieResultItem> = {}): MovieResultItem =>
	({
		id: 1,
		title: "Dune: Part Two",
		release_date: "2024-02-27",
		genre_ids: [878, 12, 18, 28],
		vote_average: 8.164,
		vote_count: 5000,
		backdrop_path: "https://image.tmdb.org/t/p/w1280/backdrop.jpg",
		poster_path: "/poster.jpg",
		...overrides,
	}) as MovieResultItem;

const logo = (file_path: string): ImageItem => ({
	file_path,
	aspect_ratio: 3,
	height: 100,
	width: 300,
	vote_average: 0,
	vote_count: 0,
});

const genres = [
	{ id: 12, name: "Adventure" },
	{ id: 18, name: "Drama" },
	{ id: 28, name: "Action" },
	{ id: 878, name: "Science Fiction" },
];

describe("selectShowcaseCandidates", () => {
	it("drops movies without a backdrop and caps the list", () => {
		const movies = [
			movie({ id: 1 }),
			movie({ id: 2, backdrop_path: "" }),
			movie({ id: 3 }),
			movie({ id: 4 }),
		];
		expect(selectShowcaseCandidates(movies, 2).map((m) => m.id)).toEqual([
			1, 3,
		]);
	});
});

describe("pickLogo", () => {
	it("returns null when there are no logos", () => {
		expect(pickLogo([])).toBeNull();
		expect(pickLogo(undefined)).toBeNull();
	});

	it("prefers a PNG logo and sizes it", () => {
		expect(pickLogo([logo("/a.svg"), logo("/b.png")])).toBe(
			"https://image.tmdb.org/t/p/w500/b.png",
		);
	});

	it("falls back to the first logo", () => {
		expect(pickLogo([logo("/a.svg")])).toBe(
			"https://image.tmdb.org/t/p/w500/a.svg",
		);
	});
});

describe("toShowcaseMovie", () => {
	it("maps details for the showcase", () => {
		expect(toShowcaseMovie(movie(), genres, "logo.png")).toEqual({
			id: 1,
			title: "Dune: Part Two",
			year: "2024",
			genres: ["Science Fiction", "Adventure", "Drama"],
			rating: 8.2,
			backdrop: "https://image.tmdb.org/t/p/w1280/backdrop.jpg",
			logo: "logo.png",
		});
	});

	it("hides the rating when nobody has voted", () => {
		expect(
			toShowcaseMovie(movie({ vote_count: 0 }), genres, null)?.rating,
		).toBeNull();
	});

	it("returns null without a backdrop", () => {
		expect(toShowcaseMovie(movie({ backdrop_path: "" }), genres, null)).toBe(
			null,
		);
	});
});
