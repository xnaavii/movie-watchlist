import { useQueryClient } from "@tanstack/react-query";
import { watchlistQueries } from "../queries";

/**
 * Refreshes everything that depends on the user's watchlist after a change:
 * every watchlist query (statuses, lists, stats, genre rows, title status).
 * Queries on screen refetch right away; the rest refetch when next shown.
 * Route loaders aren't rerun, since that would also refetch the session and
 * every other loader on the page.
 */
export function useRevalidateWatchlist() {
	const queryClient = useQueryClient();

	return () =>
		queryClient.invalidateQueries({ queryKey: watchlistQueries.allKey });
}
