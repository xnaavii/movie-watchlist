import { describe, expect, it } from "vitest";
import {
	buildAccountExport,
	type ExportSource,
	exportFileName,
} from "./exportData";

const source: ExportSource = {
	user: {
		id: "u1",
		name: "Ivan",
		email: "ivan@example.com",
		emailVerified: true,
		image: null,
		createdAt: new Date("2026-01-02T03:04:05Z"),
		updatedAt: "2026-02-01T00:00:00Z",
	},
	accounts: [
		{
			providerId: "credential",
			scope: null,
			createdAt: new Date("2026-01-02T00:00:00Z"),
		},
		{
			providerId: "google",
			scope: "email profile",
			createdAt: new Date("2026-03-01T00:00:00Z"),
		},
	],
	sessions: [
		{
			createdAt: new Date("2026-10-30T00:00:00Z"),
			updatedAt: new Date("2026-10-31T00:00:00Z"),
			expiresAt: new Date("2026-11-06T00:00:00Z"),
			ipAddress: "203.0.113.5",
			userAgent: "Safari",
		},
	],
	watchlist: [
		{
			tmdbId: 438631,
			mediaType: "movie",
			title: "Dune",
			status: "watched",
			addedAt: new Date("2026-05-01T00:00:00Z"),
			watchedAt: new Date("2026-05-02T00:00:00Z"),
		},
		{
			tmdbId: 1396,
			mediaType: "tv",
			title: null,
			status: "want_to_watch",
			addedAt: new Date("2026-06-01T00:00:00Z"),
			watchedAt: null,
		},
	],
	atmosVotes: [
		{
			tmdbId: 438631,
			mediaType: "movie",
			hasAtmos: true,
			updatedAt: new Date("2026-05-03T00:00:00Z"),
		},
	],
	soundRatings: [],
};

describe("account export", () => {
	const result = buildAccountExport(source, new Date("2026-10-31T12:00:00Z"));

	it("includes the profile, sign-in methods, sessions and activity", () => {
		expect(result.exportedAt).toBe("2026-10-31T12:00:00.000Z");
		expect(result.profile).toMatchObject({
			email: "ivan@example.com",
			createdAt: "2026-01-02T03:04:05.000Z",
			updatedAt: "2026-02-01T00:00:00.000Z",
		});
		expect(result.signInMethods.map((m) => m.method)).toEqual([
			"Email and password",
			"Google",
		]);
		expect(result.sessions[0]).toMatchObject({ ipAddress: "203.0.113.5" });
		expect(result.watchlist).toEqual([
			expect.objectContaining({
				title: "Dune",
				status: "Watched",
				tmdbUrl: "https://www.themoviedb.org/movie/438631",
				watchedAt: "2026-05-02T00:00:00.000Z",
			}),
			expect.objectContaining({ status: "Want to watch", watchedAt: null }),
		]);
		expect(result.atmosVotes).toHaveLength(1);
		expect(result.soundRatings).toEqual([]);
	});

	it("never includes passwords or tokens", () => {
		const json = JSON.stringify(
			buildAccountExport({
				...source,
				// Extra fields a careless query might pass through are dropped.
				accounts: [
					{
						...source.accounts[0],
						password: "hash",
						accessToken: "t",
					} as never,
				],
				sessions: [{ ...source.sessions[0], token: "secret" } as never],
			}),
		);
		expect(json).not.toMatch(/"(password|accessToken|token)":|hash|secret/);
	});

	it("names the file by date", () => {
		expect(exportFileName(new Date("2026-10-31T23:00:00Z"))).toBe(
			"watchlist-data-2026-10-31.json",
		);
	});
});
