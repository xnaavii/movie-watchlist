import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { MediaRef } from "#/features/media/types";
import { watchlistQueries } from "../queries";
import { removeFromWatchlist } from "../server/watchlist.functions";

export function useRemoveFromWatchlist({ media }: { media: MediaRef }) {
	const removeFromWatchlistFn = useServerFn(removeFromWatchlist);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: () =>
			removeFromWatchlistFn({
				data: { mediaType: media.mediaType, id: media.id },
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.status(media).queryKey,
			});
			queryClient.invalidateQueries({ queryKey: watchlistQueries.statsKey });
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
