import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { watchlistQueries } from "../queries";
import {
	addToWatchlist,
	removeFromWatchlist,
} from "../server/watchlist.functions";

interface UseToggleWatchlistProps {
	tmdbId: number;
}

export function useToggleWatchlist({ tmdbId }: UseToggleWatchlistProps) {
	const addToWatchlistFn = useServerFn(addToWatchlist);
	const removeFromWatchlistFn = useServerFn(removeFromWatchlist);
	const queryClient = useQueryClient();

	const { data: isInWatchlist } = useQuery({
		...watchlistQueries.status(tmdbId),
		enabled: Boolean(tmdbId),
	});

	async function toggleWatchlist(tmdbId: number) {
		try {
			if (isInWatchlist) {
				await removeFromWatchlistFn({ data: { tmdbId } });
				toast.success("Removed from watchlist");
			} else {
				const result = await addToWatchlistFn({ data: { tmdbId } });
				toast.success(
					result === null ? "Already in your watchlist" : "Added to watchlist",
				);
			}
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.status(tmdbId).queryKey,
			});
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		}
	}

	return { isInWatchlist, toggleWatchlist };
}
