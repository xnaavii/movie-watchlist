import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "#/lib/auth.functions";
import {
	insertIntoWatchlist,
	type NewMovieInsert,
	type WatchlistStatusInsert,
} from "./watchlist.server";

export const addToWatchlist = createServerFn({ method: "POST" })
	.validator(
		(data: { status?: WatchlistStatusInsert; newMovie: NewMovieInsert }) =>
			data,
	)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		return await insertIntoWatchlist(
			session.user.id,
			data.status,
			data.newMovie,
		);
	});
