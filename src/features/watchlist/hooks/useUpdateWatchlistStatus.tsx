import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { watchlistQueries } from "../queries";
import { updateWatchlistStatusFn } from "../server/watchlist.functions";
import type { WatchlistStatusInsert } from "../server/watchlist.server";

interface UseUpdateWatchlistStatus {
	tmdbId: number;
}

export function useUpdateWatchlistStatus({ tmdbId }: UseUpdateWatchlistStatus) {
	const updateWatchlistStatus = useServerFn(updateWatchlistStatusFn);
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: (status: WatchlistStatusInsert) =>
			updateWatchlistStatus({ data: { tmdbId, status } }),
		onSuccess: (_data, status) => {
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.status(tmdbId).queryKey,
			});
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
				to: "/login",
				search: { redirect: window.location.pathname },
			});
			return;
		}

		mutation.mutate(status);
	}

	return { updateStatus, isPending: mutation.isPending };
}
