import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListCheck, ListPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { watchlistQueries } from "../queries";
import { addToWatchlist } from "../server/watchlist.functions";

type AddToWatchlistButtonProps = {
	tmdbId: number;
};

export function AddToWatchlistButton({ tmdbId }: AddToWatchlistButtonProps) {
	const addToWatchlistFn = useServerFn(addToWatchlist);
	const queryClient = useQueryClient();

	const { data: isInWatchlist } = useQuery({
		...watchlistQueries.status(tmdbId),
		enabled: Boolean(tmdbId),
	});

	async function handleAddToWatchlist(tmdbId: number) {
		try {
			const result = await addToWatchlistFn({
				data: {
					tmdbId,
				},
			});
			toast.success(
				result === null ? "Already in your watchlist" : "Added to watchlist",
			);
			queryClient.invalidateQueries({
				queryKey: ["watchlist", "status", tmdbId],
			});
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		}
	}

	return (
		<Button
			className="w-fit"
			disabled={isInWatchlist}
			onClick={() => tmdbId && handleAddToWatchlist(tmdbId)}
		>
			{isInWatchlist ? <ListCheck /> : <ListPlus />}
			{isInWatchlist ? "In watchlist" : "Add to watchlist"}
		</Button>
	);
}
