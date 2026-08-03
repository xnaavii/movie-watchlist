import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
	getUserWatchlistPageFn,
	getUserWatchlistStatusesFn,
	getWatchlistStatusFn,
} from "./server/watchlist.functions";

export const watchlistQueries = {
	status: (tmdbId: number) =>
		queryOptions({
			queryKey: ["watchlist", "status", tmdbId],
			queryFn: () => getWatchlistStatusFn({ data: { tmdbId } }),
		}),
	list: () =>
		queryOptions({
			queryKey: ["watchlist", "list"],
			queryFn: () => getUserWatchlistPageFn({ data: { page: 1 } }),
		}),
	infiniteList: () =>
		infiniteQueryOptions({
			queryKey: ["watchlist", "list", "infinite"],
			queryFn: ({ pageParam }) =>
				getUserWatchlistPageFn({ data: { page: pageParam } }),
			initialPageParam: 1,
			getNextPageParam: (lastPage) =>
				lastPage.hasMore ? lastPage.page + 1 : undefined,
		}),
	watchlistStatuses: () =>
		queryOptions({
			queryKey: ["watchlist", "statuses"],
			queryFn: () => getUserWatchlistStatusesFn(),
		}),
};
