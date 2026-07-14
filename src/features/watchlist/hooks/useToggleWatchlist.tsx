import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { watchlistQueries } from "../queries";
import { addToWatchlist } from "../server/watchlist.functions";

interface UseToggleWatchlistProps {
	tmdbId: number;
}

export function useToggleWatchlist({ tmdbId }: UseToggleWatchlistProps) {
	const addToWatchlistFn = useServerFn(addToWatchlist);
	const queryClient = useQueryClient();

	const { data: isInWatchlist } = useQuery({
		...watchlistQueries.status(tmdbId),
		enabled: Boolean(tmdbId),
	});

	async function watchlistToggle(tmdbId: number) {
		try {
			const result = await addToWatchlistFn({
				data: {
					tmdbId,
				},
			});
			toast.success(
				result === null ? "Already in your watchlist" : "Added to watchlist",
			);
			queryClient.invalidateQueries({
				queryKey: ["watchlist", "status", tmdbId],
			});
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		}
	}

	return { isInWatchlist, watchlistToggle };
}
