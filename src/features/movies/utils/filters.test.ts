import type { MovieResultItem } from "@lorenzopant/tmdb";
import { describe, expect, it } from "vitest";
import {
	filterAndSortMovies,
	normalizeYearRange,
	searchFilterSearchSchema,
	watchlistFilterSearchSchema,
} from "./filters";

function movie(
	id: number,
	overrides: Partial<MovieResultItem> = {},
): MovieResultItem {
	return {
		id,
		title: `Movie ${id}`,
		original_title: `Movie ${id}`,
		overview: "",
		poster_path: null,
		backdrop_path: null,
		release_date: "2000-01-01",
		genre_ids: [],
		popularity: 1,
		vote_average: 7,
		vote_count: 100,
		adult: false,
		video: false,
		original_language: "en",
		...overrides,
	} as MovieResultItem;
}

const ids = (movies: MovieResultItem[]) => movies.map((m) => m.id);

describe("filterAndSortMovies", () => {
	it("keeps the server order with no filters", () => {
		const movies = [movie(3), movie(1), movie(2)];
		expect(ids(filterAndSortMovies(movies, {}))).toEqual([3, 1, 2]);
	});

	it("filters by genre", () => {
		const movies = [
			movie(1, { genre_ids: [28, 12] }),
			movie(2, { genre_ids: [35] }),
		];
		expect(ids(filterAndSortMovies(movies, { genre: 28 }))).toEqual([1]);
	});

	it("filters by an inclusive year range and drops undated movies", () => {
		const movies = [
			movie(1, { release_date: "1999-12-31" }),
			movie(2, { release_date: "2000-06-01" }),
			movie(3, { release_date: "2010-01-01" }),
			movie(4, { release_date: "" }),
		];
		expect(ids(filterAndSortMovies(movies, { from: 2000, to: 2010 }))).toEqual([
			2, 3,
		]);
	});

	it("accepts a year range picked in the wrong order", () => {
		const movies = [movie(1, { release_date: "2005-01-01" })];
		expect(ids(filterAndSortMovies(movies, { from: 2010, to: 2000 }))).toEqual([
			1,
		]);
	});

	it("drops movies under the minimum rating or with too few votes", () => {
		const movies = [
			movie(1, { vote_average: 8.2 }),
			movie(2, { vote_average: 6.5 }),
			movie(3, { vote_average: 9.5, vote_count: 3 }),
		];
		expect(ids(filterAndSortMovies(movies, { rating: 8 }))).toEqual([1]);
	});

	it("sorts by rating with barely rated movies last", () => {
		const movies = [
			movie(1, { vote_average: 6 }),
			movie(2, { vote_average: 10, vote_count: 2 }),
			movie(3, { vote_average: 8 }),
		];
		expect(ids(filterAndSortMovies(movies, { sort: "rating" }))).toEqual([
			3, 1, 2,
		]);
	});

	it("sorts by release date with undated movies last either way", () => {
		const movies = [
			movie(1, { release_date: "2001-01-01" }),
			movie(2, { release_date: "" }),
			movie(3, { release_date: "2020-01-01" }),
		];
		expect(ids(filterAndSortMovies(movies, { sort: "newest" }))).toEqual([
			3, 1, 2,
		]);
		expect(ids(filterAndSortMovies(movies, { sort: "oldest" }))).toEqual([
			1, 3, 2,
		]);
	});

	it("sorts by popularity and title", () => {
		const movies = [
			movie(1, { title: "Brazil", popularity: 5 }),
			movie(2, { title: "Alien", popularity: 50 }),
			movie(3, { title: "Casablanca", popularity: 10 }),
		];
		expect(ids(filterAndSortMovies(movies, { sort: "popularity" }))).toEqual([
			2, 3, 1,
		]);
		expect(ids(filterAndSortMovies(movies, { sort: "title" }))).toEqual([
			2, 1, 3,
		]);
	});

	it("does not reorder the array it was given", () => {
		const movies = [movie(1, { popularity: 1 }), movie(2, { popularity: 2 })];
		filterAndSortMovies(movies, { sort: "popularity" });
		expect(ids(movies)).toEqual([1, 2]);
	});
});

describe("normalizeYearRange", () => {
	it("leaves open ranges alone", () => {
		expect(normalizeYearRange(2000, undefined)).toEqual({
			from: 2000,
			to: undefined,
		});
	});
});

describe("filter search params", () => {
	it("drops invalid values instead of failing", () => {
		expect(
			searchFilterSearchSchema.parse({
				genre: "abc",
				from: "1990",
				rating: 42,
				sort: "nope",
			}),
		).toEqual({
			genre: undefined,
			from: 1990,
			to: undefined,
			rating: undefined,
			sort: undefined,
		});
	});

	it("parses watchlist status and sort", () => {
		expect(
			watchlistFilterSearchSchema.parse({ status: "watched", sort: "title" }),
		).toMatchObject({ status: "watched", sort: "title" });
	});
});
