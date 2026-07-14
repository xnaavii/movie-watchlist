import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "#/lib/auth.functions";
import {
	findOrCreateMovie,
	getWatchlistStatus,
	insertIntoWatchlist,
	type NewMovieInsert,
	type WatchlistStatusInsert,
} from "./watchlist.server";

export const addToWatchlist = createServerFn({ method: "POST" })
	.validator(
		(data: { status?: WatchlistStatusInsert; movie: NewMovieInsert }) => data,
	)
	.handler(async ({ data }) => {
		const session = await ensureSession();

		const movieRow = await findOrCreateMovie(data.movie);

		if (!movieRow) {
			throw new Error("Failed to find or create movie");
		}

		const [newRow] = await insertIntoWatchlist(
			session.user.id,
			data.status,
			movieRow.id,
		);

		if (!newRow) {
			throw new Error("Movie already in watchlist");
		}

		return newRow;
	});

export const getWatchlistStatusFn = createServerFn({ method: "GET" })
	.validator((data: { tmdbId: number }) => data)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		return getWatchlistStatus(session.user.id, data.tmdbId);
	});
