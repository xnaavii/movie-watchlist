import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { MediaRef } from "#/features/media/types";
import { authClient } from "#/lib/auth-client";
import { watchlistQueries } from "../queries";
import { updateWatchlistStatusFn } from "../server/watchlist.functions";
import type { WatchlistStatusInsert } from "../server/watchlist.server";

interface UseUpdateWatchlistStatus {
	media: MediaRef;
}

export function useUpdateWatchlistStatus({ media }: UseUpdateWatchlistStatus) {
	const updateWatchlistStatus = useServerFn(updateWatchlistStatusFn);
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: (status: WatchlistStatusInsert) =>
			updateWatchlistStatus({
				data: { mediaType: media.mediaType, id: media.id, status },
			}),
		onSuccess: (_data, status) => {
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.status(media).queryKey,
			});
			// A status filter on the watchlist page can hide or reveal this title.
			queryClient.invalidateQueries({ queryKey: ["watchlist", "list"] });
			queryClient.invalidateQueries({ queryKey: watchlistQueries.statsKey });
			toast.success(
				status === "watched" ? "Marked as watched" : "Marked as want to watch",
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		},
	});

	function updateStatus(status: WatchlistStatusInsert) {
		if (!session) {
			navigate({
				to: "/auth/login",
				search: { redirect: window.location.pathname },
			});
			return;
		}

		mutation.mutate(status);
	}

	return { updateStatus, isPending: mutation.isPending };
}
