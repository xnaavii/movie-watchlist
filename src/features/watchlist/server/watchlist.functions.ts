import { createServerFn } from "@tanstack/react-start";
import { ensureSession, getSession } from "#/lib/auth.functions";
import {
	addToWatchlist,
	deleteFromWatchlist,
	findMovieByTmdbId,
	findOrCreateMovie,
	getWatchlistStatus,
	selectUserWatchlist,
	selectUserWatchlistPage,
	updateWatchlistStatus,
	type WatchlistStatusInsert,
} from "./watchlist.server";

export const addToWatchlistFn = createServerFn({ method: "POST" })
	.validator((data: { tmdbId: number }) => data)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		const movieRow = await findOrCreateMovie(data.tmdbId);

		const [newRow] = await addToWatchlist(session.user.id, movieRow.id);

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

export const updateWatchlistStatusFn = createServerFn({ method: "POST" })
	.validator((data: { tmdbId: number; status: WatchlistStatusInsert }) => data)
	.handler(async ({ data }) => {
		const session = await ensureSession();

		const movieRow = await findOrCreateMovie(data.tmdbId);

		const updated = await updateWatchlistStatus({
			userId: session.user.id,
			movieId: movieRow.id,
			status: data.status,
		});

		if (!updated) {
			throw new Error("Failed updating status");
		}

		return updated;
	});

export const getWatchlistStatusFn = createServerFn({ method: "GET" })
	.validator((data: { tmdbId: number }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();

		if (!session) return null;

		return await getWatchlistStatus(session.user.id, data.tmdbId);
	});

export const getUserWatchlist = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) return [];

		return await selectUserWatchlist(session.user.id);
	},
);

const WATCHLIST_PAGE_SIZE = 20;

export const getUserWatchlistPageFn = createServerFn({ method: "GET" })
	.validator((data: { page: number }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) {
			return { results: [], page: data.page, hasMore: false };
		}

		const offset = (data.page - 1) * WATCHLIST_PAGE_SIZE;
		const rows = await selectUserWatchlistPage(session.user.id, {
			limit: WATCHLIST_PAGE_SIZE,
			offset,
		});

		return {
			results: rows,
			page: data.page,
			hasMore: rows.length === WATCHLIST_PAGE_SIZE,
		};
	});