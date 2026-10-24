// features/watchlist/hooks/useAddToWatchlist.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { MediaRef } from "#/features/media/types";
import { authClient } from "#/lib/auth-client";
import { watchlistQueries } from "../queries";
import { addToWatchlistFn } from "../server/watchlist.functions";

export function useAddToWatchlist({ media }: { media: MediaRef }) {
	const addToWatchlist = useServerFn(addToWatchlistFn);
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: () =>
			addToWatchlist({ data: { mediaType: media.mediaType, id: media.id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.status(media).queryKey,
			});
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.watchlistStatuses().queryKey,
			});
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.list().queryKey,
			});
			queryClient.invalidateQueries({ queryKey: watchlistQueries.statsKey });
			toast.success("Added to watchlist");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		},
	});

	function addToList() {
		if (!session) {
			navigate({
				to: "/auth/login",
				search: { redirect: window.location.pathname },
			});
			return;
		}

		mutation.mutate();
	}

	return { addToList, isPending: mutation.isPending };
}
