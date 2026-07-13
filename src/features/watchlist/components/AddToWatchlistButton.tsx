import type { MovieDetails } from "@lorenzopant/tmdb";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListCheck, ListPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { watchlistQueries } from "../queries";
import { addToWatchlist } from "../server/watchlist.functions";

type AddToWatchlistButtonProps = {
	movie: MovieDetails;
};

export function AddToWatchlistButton({ movie }: AddToWatchlistButtonProps) {
	const addToWatchlistFn = useServerFn(addToWatchlist);
	const queryClient = useQueryClient();

	const { data: isInWatchlist } = useQuery(watchlistQueries.status(movie.id));

	return (
		<Button
			className="w-fit"
			disabled={isInWatchlist}
			onClick={async () => {
				try {
					const result = await addToWatchlistFn({
						data: {
							newMovie: {
								tmdbId: movie.id,
								title: movie.title,
								releaseDate: movie.release_date,
								posterPath: movie.poster_path,
							},
						},
					});
					toast.success(
						result === null
							? "Already in your watchlist"
							: "Added to watchlist",
					);
					queryClient.invalidateQueries({
						queryKey: ["watchlist", "status", movie.id],
					});
				} catch {
					toast.error("Something went wrong. Please try again.");
				}
			}}
		>
			{isInWatchlist ? <ListCheck /> : <ListPlus />}
			{isInWatchlist ? "In watchlist" : "Add to watchlist"}
		</Button>
	);
}
