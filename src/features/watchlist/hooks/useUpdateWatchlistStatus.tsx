import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { assertOnline, getClientUser } from "#/lib/clientAuth";
import { toastGuestSave } from "../guest/guestToast";
import { type GuestMediaInput, saveGuestEntry } from "../guest/guestWatchlist";
import { updateWatchlistStatusFn } from "../server/watchlist.functions";
import type { WatchlistStatus } from "../types";
import { useRevalidateWatchlist } from "./useRevalidateWatchlist";

interface UseUpdateWatchlistStatus {
	media: GuestMediaInput;
}

export function useUpdateWatchlistStatus({ media }: UseUpdateWatchlistStatus) {
	const updateWatchlistStatus = useServerFn(updateWatchlistStatusFn);
	const revalidateWatchlist = useRevalidateWatchlist();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: async (status: WatchlistStatus) => {
			if ((await getClientUser()) !== null) {
				assertOnline();
				await updateWatchlistStatus({
					data: { mediaType: media.mediaType, id: media.id, status },
				});
				return "account" as const;
			}
			saveGuestEntry(media, status);
			return "guest" as const;
		},
		onSuccess: (savedTo, status) => {
			revalidateWatchlist();
			const message =
				status === "watched" ? "Marked as watched" : "Marked as want to watch";
			if (savedTo === "guest") {
				toastGuestSave(message, () => navigate({ to: "/auth/signup" }));
			} else {
				toast.success(message);
			}
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		},
	});

	return {
		updateStatus: (status: WatchlistStatus) => mutation.mutate(status),
		isPending: mutation.isPending,
	};
}
