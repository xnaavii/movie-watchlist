import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { watchlistQueries } from "../queries";

/**
 * Refreshes everything that depends on the user's watchlist after a change:
 * every watchlist query (statuses, lists, stats, genre rows, title status) and
 * every route loader, so the whole app reflects the change, not just the
 * component that made it.
 */
export function useRevalidateWatchlist() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: watchlistQueries.allKey }),
			router.invalidate(),
		]);
}
