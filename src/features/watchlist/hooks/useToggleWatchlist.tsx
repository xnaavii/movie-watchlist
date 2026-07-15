import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { watchlistQueries } from "../queries";
import {
	addToWatchlistFn,
	removeFromWatchlist,
} from "../server/watchlist.functions";

interface UseToggleWatchlistProps {
	tmdbId: number;
}

export function useToggleWatchlist({ tmdbId }: UseToggleWatchlistProps) {
	const addToWatchlist = useServerFn(addToWatchlistFn);
	const removeFromWatchlistFn = useServerFn(removeFromWatchlist);
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	const { data: isInWatchlist } = useQuery({
		...watchlistQueries.status(tmdbId),
		enabled: Boolean(tmdbId),
	});

	async function toggleWatchlist(tmdbId: number) {
		if (!session) {
			navigate({
				to: "/login",
				search: { redirect: window.location.pathname },
			});
			return;
		}

		try {
			if (isInWatchlist) {
				await removeFromWatchlistFn({ data: { tmdbId } });
				toast.success("Removed from watchlist");
			} else {
				const result = await addToWatchlist({ data: { tmdbId } });
				toast.success(
					result === null ? "Already in your watchlist" : "Added to watchlist",
				);
			}
			queryClient.invalidateQueries({
				queryKey: watchlistQueries.status(tmdbId).queryKey,
			});
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		}
	}

	return { isInWatchlist, toggleWatchlist };
}
