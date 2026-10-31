import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { findDiscoverGenre } from "#/features/media/genres";
import type { MediaRef } from "#/features/media/types";
import type { WatchlistFilters } from "#/features/media/utils/filters";
import { forUserOrGuest } from "#/lib/clientAuth";
import {
	getGuestMediaByGenre,
	getGuestStatus,
	getGuestStatuses,
	getGuestWatchlistPage,
} from "./guest/guestWatchlist";
import {
	getProfileStatsFn,
	getUserWatchlistPageFn,
	getUserWatchlistStatusesFn,
	getWatchlistMediaByGenreFn,
	getWatchlistStatusFn,
} from "./server/watchlist.functions";

/**
 * Watchlist queries. Signed-in users read the server; signed-out visitors read
 * the guest list saved in this browser, without a request.
 */
export const watchlistQueries = {
	/** Prefix shared by every watchlist query, for invalidating them all. */
	allKey: ["watchlist"] as const,
	status: ({ mediaType, id }: MediaRef) =>
		queryOptions({
			queryKey: ["watchlist", "status", mediaType, id],
			queryFn: () =>
				forUserOrGuest(
					() => getWatchlistStatusFn({ data: { mediaType, id } }),
					() => getGuestStatus({ mediaType, id }),
				),
		}),
	mediaByGenre: (genreSlug: string) =>
		queryOptions({
			queryKey: ["watchlist", "media", "genre", genreSlug],
			queryFn: () =>
				forUserOrGuest(
					() => getWatchlistMediaByGenreFn({ data: { genreSlug } }),
					() => {
						const genre = findDiscoverGenre(genreSlug);
						return genre ? getGuestMediaByGenre(genre.ids) : [];
					},
				),
		}),
	list: () =>
		queryOptions({
			queryKey: ["watchlist", "list"],
			queryFn: () =>
				forUserOrGuest(
					() => getUserWatchlistPageFn({ data: { page: 1 } }),
					() => getGuestWatchlistPage(1),
				),
		}),
	infiniteList: (filters: WatchlistFilters = {}) =>
		infiniteQueryOptions({
			queryKey: ["watchlist", "list", "infinite", filters],
			queryFn: ({ pageParam }) =>
				forUserOrGuest(
					() => getUserWatchlistPageFn({ data: { page: pageParam, filters } }),
					() => getGuestWatchlistPage(pageParam, filters),
				),
			initialPageParam: 1,
			getNextPageParam: (lastPage) =>
				lastPage.hasMore ? lastPage.page + 1 : undefined,
		}),
	statsKey: ["watchlist", "stats"] as const,
	/** Account only: the profile page needs runtimes the guest list lacks. */
	stats: () =>
		queryOptions({
			queryKey: ["watchlist", "stats"],
			queryFn: () => getProfileStatsFn(),
		}),
	watchlistStatuses: () =>
		queryOptions({
			queryKey: ["watchlist", "statuses"],
			queryFn: () =>
				forUserOrGuest(
					() => getUserWatchlistStatusesFn(),
					() => getGuestStatuses(),
				),
		}),
};
