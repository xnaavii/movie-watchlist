import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { watchlistQueries } from "../queries";
import { removeFromWatchlist } from "../server/watchlist.functions";

export function useRemoveFromWatchlist({ tmdbId }: { tmdbId: number }) {
	const removeFromWatchlistFn = useServerFn(removeFromWatchlist);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: () => removeFromWatchlistFn({ data: { tmdbId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.status(tmdbId).queryKey,
			});
			toast.success("Removed from watchlist");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		},
	});

	return { remove: mutation.mutate, isPending: mutation.isPending };
}
