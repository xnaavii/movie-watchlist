import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { MediaRef } from "#/features/media/types";
import type { WatchlistFilters } from "#/features/media/utils/filters";
import {
	getProfileStatsFn,
	getUserWatchlistPageFn,
	getUserWatchlistStatusesFn,
	getWatchlistMediaByGenreFn,
	getWatchlistStatusFn,
} from "./server/watchlist.functions";

export const watchlistQueries = {
	/** Prefix shared by every watchlist query, for invalidating them all. */
	allKey: ["watchlist"] as const,
	status: ({ mediaType, id }: MediaRef) =>
		queryOptions({
			queryKey: ["watchlist", "status", mediaType, id],
			queryFn: () => getWatchlistStatusFn({ data: { mediaType, id } }),
		}),
	mediaByGenreId: (genreId: number) =>
		queryOptions({
			queryKey: ["watchlist", "media", "genre", genreId],
			queryFn: () => getWatchlistMediaByGenreFn({ data: { genreId } }),
			enabled: !!genreId,
		}),
	list: () =>
		queryOptions({
			queryKey: ["watchlist", "list"],
			queryFn: () => getUserWatchlistPageFn({ data: { page: 1 } }),
		}),
	infiniteList: (filters: WatchlistFilters = {}) =>
		infiniteQueryOptions({
			queryKey: ["watchlist", "list", "infinite", filters],
			queryFn: ({ pageParam }) =>
				getUserWatchlistPageFn({ data: { page: pageParam, filters } }),
			initialPageParam: 1,
			getNextPageParam: (lastPage) =>
				lastPage.hasMore ? lastPage.page + 1 : undefined,
		}),
	statsKey: ["watchlist", "stats"] as const,
	stats: () =>
		queryOptions({
			queryKey: ["watchlist", "stats"],
			queryFn: () => getProfileStatsFn(),
		}),
	watchlistStatuses: () =>
		queryOptions({
			queryKey: ["watchlist", "statuses"],
			queryFn: () => getUserWatchlistStatusesFn(),
		}),
};
