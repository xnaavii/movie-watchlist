import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { MediaRef } from "#/features/media/types";
import { assertOnline, getClientUser } from "#/lib/clientAuth";
import { removeGuestEntry } from "../guest/guestWatchlist";
import { removeFromWatchlist } from "../server/watchlist.functions";
import { useRevalidateWatchlist } from "./useRevalidateWatchlist";

export function useRemoveFromWatchlist({ media }: { media: MediaRef }) {
	const removeFromWatchlistFn = useServerFn(removeFromWatchlist);
	const revalidateWatchlist = useRevalidateWatchlist();

	const mutation = useMutation({
		mutationFn: async () => {
			const ref = { mediaType: media.mediaType, id: media.id };
			if ((await getClientUser()) !== null) {
				assertOnline();
				await removeFromWatchlistFn({ data: ref });
			} else {
				removeGuestEntry(ref);
			}
		},
		onSuccess: () => {
			revalidateWatchlist();
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

	return { remove: () => mutation.mutate(), isPending: mutation.isPending };
}
