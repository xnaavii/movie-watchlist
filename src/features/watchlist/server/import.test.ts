import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	const state = {
		/** Stored media rows, keyed by nothing: lookups take them in order. */
		mediaRows: [] as unknown[][],
		/** Genre counts for the stored rows, in order. */
		genreCounts: [] as unknown[][],
		inserted: [] as unknown[],
		returningCount: undefined as number | undefined,
	};
	const db = {
		// `select()` reads media rows; `select({ genreCount })` counts genres.
		select: vi.fn((fields?: object) => ({
			from: () => ({
				where: () =>
					Promise.resolve(
						(fields ? state.genreCounts : state.mediaRows).shift() ?? [],
					),
			}),
		})),
		insert: vi.fn(() => ({
			values: (rows: unknown[]) => {
				state.inserted.push(...rows);
				return {
					onConflictDoNothing: () => ({
						returning: () =>
							Promise.resolve(
								rows
									.slice(0, state.returningCount ?? rows.length)
									.map((_, id) => ({ id })),
							),
					}),
				};
			},
		})),
	};
	return { state, db, getMediaDetails: vi.fn() };
});

vi.mock("#/db", () => ({ db: mocks.db }));
vi.mock("#/features/media/server/media.functions", () => ({
	getMediaDetails: mocks.getMediaDetails,
}));
vi.mock("#/lib/auth.functions", () => ({ ensureSession: vi.fn() }));

import { IMPORT_BATCH_SIZE, parseEntries } from "./import.functions";
import { importWatchlistEntries } from "./watchlist.server";

/** A stored title that already has genres, so no TMDB call is needed. */
function storedTitle(id: number) {
	mocks.state.mediaRows.push([{ tmdbId: id }]);
	mocks.state.genreCounts.push([{ genreCount: 2 }]);
}

beforeEach(() => {
	mocks.state.mediaRows = [];
	mocks.state.genreCounts = [];
	mocks.state.inserted = [];
	mocks.state.returningCount = undefined;
	mocks.db.insert.mockClear();
	mocks.getMediaDetails.mockReset();
});

describe("parseEntries", () => {
	it("keeps valid titles and fills in defaults", () => {
		const parsed = parseEntries([
			{
				mediaType: "movie",
				id: 1,
				status: "watched",
				addedAt: "2026-01-01T00:00:00.000Z",
				watchedAt: "2026-01-02T00:00:00.000Z",
			},
			{ mediaType: "tv", id: 2, status: "nonsense", addedAt: 5 },
		]);
		expect(parsed[0]).toEqual({
			mediaType: "movie",
			id: 1,
			status: "watched",
			addedAt: "2026-01-01T00:00:00.000Z",
			watchedAt: "2026-01-02T00:00:00.000Z",
		});
		expect(parsed[1]).toEqual({
			mediaType: "tv",
			id: 2,
			status: "want_to_watch",
			addedAt: expect.any(String),
			watchedAt: null,
		});
		expect(Number.isNaN(Date.parse(parsed[1]?.addedAt ?? ""))).toBe(false);
	});

	it("caps a request at one batch", () => {
		const many = Array.from({ length: IMPORT_BATCH_SIZE + 5 }, (_, i) => ({
			mediaType: "movie",
			id: i + 1,
		}));
		expect(parseEntries(many)).toHaveLength(IMPORT_BATCH_SIZE);
	});

	it.each([
		["not a list", { mediaType: "movie", id: 1 }],
		["an unknown media type", [{ mediaType: "person", id: 1 }]],
		["a non-integer id", [{ mediaType: "movie", id: "1" }]],
		["a fractional id", [{ mediaType: "movie", id: 1.5 }]],
		["an empty entry", [null]],
	])("rejects %s", (_, data) => {
		expect(() => parseEntries(data)).toThrow();
	});
});

describe("importWatchlistEntries", () => {
	const entry = (id: number, overrides = {}) => ({
		mediaType: "movie" as const,
		id,
		status: "want_to_watch" as const,
		addedAt: "2026-03-04T05:06:07.000Z",
		watchedAt: null,
		...overrides,
	});

	it("adds titles to the account with their saved dates", async () => {
		storedTitle(1);
		storedTitle(2);

		const result = await importWatchlistEntries("user-1", [
			entry(1),
			entry(2, { status: "watched", watchedAt: "2026-03-05T00:00:00.000Z" }),
		]);

		expect(result).toEqual({ imported: 2, failed: 0 });
		expect(mocks.state.inserted).toEqual([
			{
				userId: "user-1",
				tmdbId: 1,
				mediaType: "movie",
				status: "want_to_watch",
				addedAt: new Date("2026-03-04T05:06:07.000Z"),
				watchedAt: null,
			},
			expect.objectContaining({
				tmdbId: 2,
				status: "watched",
				watchedAt: new Date("2026-03-05T00:00:00.000Z"),
			}),
		]);
		expect(mocks.getMediaDetails).not.toHaveBeenCalled();
	});

	it("replaces unreadable dates instead of storing Invalid Date", async () => {
		storedTitle(1);
		await importWatchlistEntries("user-1", [
			entry(1, { addedAt: "yesterday-ish", watchedAt: "nope" }),
		]);
		const [row] = mocks.state.inserted as { addedAt: Date; watchedAt: Date }[];
		expect(Number.isNaN(row?.addedAt.getTime())).toBe(false);
		expect(row?.watchedAt).toBeNull();
	});

	it("counts titles already in the account as not imported", async () => {
		storedTitle(1);
		storedTitle(2);
		mocks.state.returningCount = 1;
		await expect(
			importWatchlistEntries("user-1", [entry(1), entry(2)]),
		).resolves.toEqual({ imported: 1, failed: 0 });
	});

	it("skips titles TMDB can't find and still imports the rest", async () => {
		storedTitle(1);
		// Title 2 isn't stored yet and TMDB doesn't know it.
		mocks.getMediaDetails.mockRejectedValue(new Error("Not found"));
		await expect(
			importWatchlistEntries("user-1", [entry(1), entry(2)]),
		).resolves.toEqual({ imported: 1, failed: 1 });
		expect(mocks.state.inserted).toEqual([
			expect.objectContaining({ tmdbId: 1 }),
		]);
	});

	it("writes nothing when no title can be found", async () => {
		mocks.getMediaDetails.mockRejectedValue(new Error("Not found"));
		await expect(
			importWatchlistEntries("user-1", [entry(1), entry(2)]),
		).resolves.toEqual({ imported: 0, failed: 2 });
		expect(mocks.db.insert).not.toHaveBeenCalled();
	});
});
