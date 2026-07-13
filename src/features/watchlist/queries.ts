import { queryOptions } from "@tanstack/react-query";
import { getWatchlistStatusFn } from "./server/watchlist.functions";

export const watchlistQueries = {
	status: (tmdbId: number) =>
		queryOptions({
			queryKey: ["watchlist", "status", tmdbId],
			queryFn: () => getWatchlistStatusFn({ data: { tmdbId } }),
		}),
};
