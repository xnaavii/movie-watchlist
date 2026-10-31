import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { assertOnline, getClientUser } from "#/lib/clientAuth";
import { toastGuestSave } from "../guest/guestToast";
import { type GuestMediaInput, saveGuestEntry } from "../guest/guestWatchlist";
import { addToWatchlistFn } from "../server/watchlist.functions";
import { useRevalidateWatchlist } from "./useRevalidateWatchlist";

/** Saves a title: to the account when signed in, to this device otherwise. */
export function useAddToWatchlist({ media }: { media: GuestMediaInput }) {
	const addToWatchlist = useServerFn(addToWatchlistFn);
	const revalidateWatchlist = useRevalidateWatchlist();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: async () => {
			if ((await getClientUser()) !== null) {
				assertOnline();
				await addToWatchlist({
					data: { mediaType: media.mediaType, id: media.id },
				});
				return "account" as const;
			}
			saveGuestEntry(media);
			return "guest" as const;
		},
		onSuccess: (savedTo) => {
			revalidateWatchlist();
			if (savedTo === "guest") {
				toastGuestSave("Added to watchlist", () =>
					navigate({ to: "/auth/signup" }),
				);
			} else {
				toast.success("Added to watchlist");
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

	return { addToList: () => mutation.mutate(), isPending: mutation.isPending };
}
