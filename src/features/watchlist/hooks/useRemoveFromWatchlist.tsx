import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { MediaRef } from "#/features/media/types";
import { saveForUserOrGuest } from "#/lib/clientAuth";
import { removeGuestEntry } from "../guest/guestWatchlist";
import { removeFromWatchlist } from "../server/watchlist.functions";
import { useRevalidateWatchlist } from "./useRevalidateWatchlist";

export function useRemoveFromWatchlist({ media }: { media: MediaRef }) {
	const removeFromWatchlistFn = useServerFn(removeFromWatchlist);
	const revalidateWatchlist = useRevalidateWatchlist();

	const mutation = useMutation({
		mutationFn: () =>
			saveForUserOrGuest(
				() =>
					removeFromWatchlistFn({
						data: { mediaType: media.mediaType, id: media.id },
					}),
				() => removeGuestEntry(media),
			),
		onSuccess: () => {
			revalidateWatchlist();
			toast.success("Removed from watchlist");
		},
	});

	return { remove: () => mutation.mutate(), isPending: mutation.isPending };
}
