import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { WatchlistFilters } from "#/features/movies/utils/filters";
import {
	getUserWatchlistPageFn,
	getUserWatchlistStatusesFn,
	getWatchlistMoviesByGenreFn,
	getWatchlistStatusFn,
} from "./server/watchlist.functions";

export const watchlistQueries = {
	status: (movieId: number) =>
		queryOptions({
			queryKey: ["watchlist", "status", movieId],
			queryFn: () => getWatchlistStatusFn({ data: { movieId } }),
		}),
	moviesByGenreId: (genreId: number) =>
		queryOptions({
			queryKey: ["watchlist", "movies", "genre", genreId],
			queryFn: () => getWatchlistMoviesByGenreFn({ data: { genreId } }),
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
	watchlistStatuses: () =>
		queryOptions({
			queryKey: ["watchlist", "statuses"],
			queryFn: () => getUserWatchlistStatusesFn(),
		}),
};
