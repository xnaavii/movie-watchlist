import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "#/lib/auth.functions";
import {
	deleteFromWatchlist,
	findMovieByTmdbId,
	findOrCreateMovie,
	getWatchlistStatus,
	insertIntoWatchlist,
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
		const session = await ensureSession();
		return getWatchlistStatus(session.user.id, data.tmdbId);
	});
