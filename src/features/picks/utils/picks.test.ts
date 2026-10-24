import type { MovieResultItem } from "@lorenzopant/tmdb";
import { describe, expect, it } from "vitest";
import type { PickIntent, PickRequest } from "../types";
import {
	describeRequest,
	genreIdsFromNames,
	intentToDiscoverParams,
	looksLikeDescription,
	mergeCandidates,
	resolvePicks,
	toCandidate,
} from "./picks";

const GENRES = [
	{ id: 35, name: "Comedy" },
	{ id: 9648, name: "Mystery" },
	{ id: 27, name: "Horror" },
	{ id: 878, name: "Science Fiction" },
];

const BASE_REQUEST: PickRequest = {
	prompt: "",
	moods: [],
	time: "any",
	company: undefined,
	useWatchlist: false,
};

const BASE_INTENT: PickIntent = {
	summary: "Cozy mysteries",
	genres: [],
	excludeGenres: [],
	keywords: [],
	similarTo: [],
	releaseYearFrom: null,
	releaseYearTo: null,
	minRuntime: null,
	maxRuntime: null,
	minRating: null,
	originalLanguage: null,
	sort: "popular",
};

function movie(id: number, extra: Partial<MovieResultItem> = {}) {
	return {
		id,
		title: `Movie ${id}`,
		original_title: `Movie ${id}`,
		overview: "An overview.",
		poster_path: `/poster-${id}.jpg`,
		adult: false,
		original_language: "en",
		genre_ids: [9648],
		popularity: 10,
		softcore: false,
		release_date: "1995-06-01",
		video: false,
		vote_average: 7.26,
		vote_count: 500,
		...extra,
	} satisfies MovieResultItem;
}

describe("looksLikeDescription", () => {
	it.each([
		"cozy 90s mystery under 2 hours",
		"something like knives out",
		"a sad movie about grief",
		"space opera with big battles and a love story",
		"dark funny crime with a twist",
	])("treats %s as a description", (query) => {
		expect(looksLikeDescription(query)).toBe(true);
	});

	it.each([
		"dune",
		"the dark knight",
		"tom hanks",
		"lord of the rings",
		"night of the living dead",
		"date night",
		"the man from uncle",
	])("treats %s as a title or name", (query) => {
		expect(looksLikeDescription(query)).toBe(false);
	});
});

describe("describeRequest", () => {
	it("lists only the parts the user filled in", () => {
		expect(
			describeRequest({
				...BASE_REQUEST,
				prompt: "a heist",
				moods: ["Funny", "Tense"],
				time: "short",
				company: "Friends",
			}),
		).toBe(
			"Request: a heist\nMood: Funny, Tense\nTime: Under 90 min\nWatching with: Friends",
		);
	});

	it("falls back to a generic request when the form is empty", () => {
		expect(describeRequest(BASE_REQUEST)).toBe(
			"Request: something good to watch tonight",
		);
	});
});

describe("genreIdsFromNames", () => {
	it("matches names loosely and drops unknown ones", () => {
		expect(
			genreIdsFromNames(["mystery", "Sci-Fi", "science fiction"], GENRES),
		).toEqual([9648, 878]);
	});
});

describe("intentToDiscoverParams", () => {
	it("maps years, genres and keywords onto discover filters", () => {
		const params = intentToDiscoverParams(
			{
				...BASE_INTENT,
				genres: ["Mystery", "Comedy"],
				excludeGenres: ["Horror"],
				releaseYearFrom: 1990,
				releaseYearTo: 1999,
				maxRuntime: 120,
			},
			BASE_REQUEST,
			GENRES,
			[12, 34],
		);
		expect(params).toMatchObject({
			with_genres: "9648|35",
			without_genres: "27",
			with_keywords: "12|34",
			"primary_release_date.gte": "1990-01-01",
			"primary_release_date.lte": "1999-12-31",
			"with_runtime.lte": 120,
			sort_by: "popularity.desc",
		});
	});

	it("uses the tighter of the time pill and the described runtime", () => {
		const params = intentToDiscoverParams(
			{ ...BASE_INTENT, maxRuntime: 150 },
			{ ...BASE_REQUEST, time: "short" },
			GENRES,
		);
		expect(params["with_runtime.lte"]).toBe(90);
	});

	it("asks for more votes when sorting by rating", () => {
		const params = intentToDiscoverParams(
			{ ...BASE_INTENT, sort: "top_rated" },
			BASE_REQUEST,
			GENRES,
		);
		expect(params.sort_by).toBe("vote_average.desc");
		expect(params["vote_count.gte"]).toBe(300);
	});
});

describe("mergeCandidates", () => {
	it("keeps the first copy, skips watched and posterless movies, and caps the list", () => {
		const merged = mergeCandidates(
			[
				[movie(1), movie(2)],
				[movie(2), movie(3, { poster_path: undefined }), movie(4), movie(5)],
			],
			new Set([4]),
			3,
		);
		expect(merged.map((m) => m.id)).toEqual([1, 2, 5]);
	});
});

describe("toCandidate", () => {
	it("shortens long overviews and names genres", () => {
		const candidate = toCandidate(
			movie(1, { overview: "x".repeat(300) }),
			GENRES,
			true,
		);
		expect(candidate.genres).toEqual(["Mystery"]);
		expect(candidate.year).toBe("1995");
		expect(candidate.rating).toBe(7.3);
		expect(candidate.overview.length).toBeLessThan(230);
		expect(candidate.onWatchlist).toBe(true);
	});
});

describe("resolvePicks", () => {
	it("drops ids that are not candidates or repeat, and stops at the limit", () => {
		const picks = resolvePicks(
			{
				picks: [
					{ id: 2, reason: " Great fit. " },
					{ id: 99, reason: "Made up." },
					{ id: 2, reason: "Again." },
					{ id: 1, reason: "Also good." },
					{ id: 3, reason: "Over the limit." },
				],
			},
			[movie(1), movie(2), movie(3)],
			new Set([1]),
			2,
		);
		expect(picks.map((pick) => [pick.movie.id, pick.reason])).toEqual([
			[2, "Great fit."],
			[1, "Also good."],
		]);
		expect(picks[1].onWatchlist).toBe(true);
	});
});
