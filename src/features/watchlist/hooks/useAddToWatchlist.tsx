// features/watchlist/hooks/useAddToWatchlist.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { watchlistQueries } from "../queries";
import { addToWatchlistFn } from "../server/watchlist.functions";

export function useAddToWatchlist({ movieId }: { movieId: number }) {
	const addToWatchlist = useServerFn(addToWatchlistFn);
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: () => addToWatchlist({ data: { movieId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.status(movieId).queryKey,
			});
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
				to: "/login",
				search: { redirect: window.location.pathname },
			});
			return;
		}

		mutation.mutate();
	}

	return { addToList, isPending: mutation.isPending };
}
