import { createServerFn } from "@tanstack/react-start";
import { findDiscoverGenre } from "#/features/media/genres";
import type { MediaRef } from "#/features/media/types";
import {
	type WatchlistFilters,
	watchlistFilterSearchSchema,
} from "#/features/media/utils/filters";
import { ensureSession, getSession } from "#/lib/auth.functions";
import { buildProfileStats } from "../utils/stats";
import {
	addToWatchlist,
	backfillMediaDetails,
	deleteFromWatchlist,
	findOrCreateMedia,
	getWatchlistStatus,
	selectStatsEntries,
	selectUserWatchlistPage,
	selectUserWatchlistStatuses,
	selectWatchlistGenreLinks,
	selectWatchlistMediaByGenre,
	updateWatchlistStatus,
	type WatchlistStatusInsert,
} from "./watchlist.server";

const WATCHLIST_PAGE_SIZE = 20;

/** Keeps only the ref, so callers can pass a whole media item. */
const toRef = ({ mediaType, id }: MediaRef): MediaRef => ({ mediaType, id });

export const addToWatchlistFn = createServerFn({ method: "POST" })
	.validator(toRef)
	.handler(async ({ data }) => {
		const session = await ensureSession();

		await findOrCreateMedia(data);

		const [newRow] = await addToWatchlist(session.user.id, data);

		if (!newRow) {
			throw new Error("Already in your watchlist");
		}

		return newRow;
	});

export const removeFromWatchlist = createServerFn({ method: "POST" })
	.validator(toRef)
	.handler(async ({ data }) => {
		const session = await ensureSession();

		return await deleteFromWatchlist(session.user.id, data);
	});

export const updateWatchlistStatusFn = createServerFn({ method: "POST" })
	.validator((data: MediaRef & { status: WatchlistStatusInsert }) => ({
		...toRef(data),
		status: data.status,
	}))
	.handler(async ({ data }) => {
		const session = await ensureSession();
		const { status, ...ref } = data;

		await findOrCreateMedia(ref);

		const updated = await updateWatchlistStatus({
			userId: session.user.id,
			ref,
			status,
		});

		if (!updated) {
			throw new Error("Failed updating status");
		}

		return updated;
	});

export const getWatchlistStatusFn = createServerFn({ method: "GET" })
	.validator(toRef)
	.handler(async ({ data }) => {
		const session = await getSession();

		if (!session) return null;

		return await getWatchlistStatus(session.user.id, data);
	});

export const getUserWatchlistPageFn = createServerFn({ method: "GET" })
	.validator((data: { page: number; filters?: WatchlistFilters }) => ({
		page: data.page,
		filters: watchlistFilterSearchSchema.parse(data.filters ?? {}),
	}))
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) {
			return { results: [], page: data.page, hasMore: false };
		}

		const offset = (data.page - 1) * WATCHLIST_PAGE_SIZE;
		const rows = await selectUserWatchlistPage(session.user.id, {
			limit: WATCHLIST_PAGE_SIZE,
			offset,
			filters: data.filters,
		});

		return {
			results: rows,
			page: data.page,
			hasMore: rows.length === WATCHLIST_PAGE_SIZE,
		};
	});

export const getUserWatchlistStatusesFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getSession();
	if (!session) return {};
	return await selectUserWatchlistStatuses(session.user.id);
});

export const getWatchlistMediaByGenreFn = createServerFn({ method: "GET" })
	.validator((data: { genreSlug: string }) => data)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		const genre = findDiscoverGenre(data.genreSlug);
		if (!genre) return [];
		return await selectWatchlistMediaByGenre(session.user.id, genre.ids);
	});

export const getProfileStatsFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await ensureSession();
		const userId = session.user.id;

		await backfillMediaDetails(userId);
		const [entries, genreLinks] = await Promise.all([
			selectStatsEntries(userId),
			selectWatchlistGenreLinks(userId),
		]);

		return buildProfileStats(entries, genreLinks);
	},
);
