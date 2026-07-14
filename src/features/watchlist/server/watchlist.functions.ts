import { createServerFn } from "@tanstack/react-start";
import { ensureSession, getSession } from "#/lib/auth.functions";
import {
	deleteFromWatchlist,
	findMovieByTmdbId,
	findOrCreateMovie,
	getWatchlistStatus,
	insertIntoWatchlist,
	selectUserWatchlist,
	type WatchlistStatusInsert,
} from "./watchlist.server";

export const addToWatchlist = createServerFn({ method: "POST" })
	.validator((data: { status?: WatchlistStatusInsert; tmdbId: number }) => data)
	.handler(async ({ data }) => {
		const session = await ensureSession();

		const movieRow = await findOrCreateMovie(data.tmdbId);

		if (!movieRow) {
			throw new Error("Failed to find or create movie");
		}

		const [newRow] = await insertIntoWatchlist({
			userId: session.user.id,
			movieId: movieRow.id,
			status: data.status,
		});

		if (!newRow) {
			throw new Error("Movie already in watchlist");
		}

		return newRow;
	});

export const removeFromWatchlist = createServerFn({ method: "POST" })
	.validator((data: { tmdbId: number }) => data)
	.handler(async ({ data }) => {
		const session = await ensureSession();

		const movieRow = await findMovieByTmdbId(data.tmdbId);
		if (!movieRow) return null;

		return await deleteFromWatchlist({
			userId: session.user.id,
			movieId: movieRow.id,
		});
	});

export const getWatchlistStatusFn = createServerFn({ method: "GET" })
	.validator((data: { tmdbId: number }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();

		if (!session) return false;

		return await getWatchlistStatus(session.user.id, data.tmdbId);
	});

export const getUserWatchlist = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) return [];

		return await selectUserWatchlist(session.user.id);
	},
);
