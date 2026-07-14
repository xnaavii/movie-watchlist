import type { MovieDetails } from "@lorenzopant/tmdb";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListCheck, ListPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { movieQueries } from "#/features/movies/queries";
import { watchlistQueries } from "../queries";
import { addToWatchlist } from "../server/watchlist.functions";

type AddToWatchlistButtonProps = {
	movieId: number;
};

export function AddToWatchlistButton({ movieId }: AddToWatchlistButtonProps) {
	const addToWatchlistFn = useServerFn(addToWatchlist);
	const queryClient = useQueryClient();

	const { data: movie } = useQuery(movieQueries.details({ movie_id: movieId }));

	const { data: isInWatchlist } = useQuery({
		...watchlistQueries.status(movie?.id ?? movieId),
		enabled: Boolean(movie),
	});

	async function handleAddToWatchlist(movie: MovieDetails) {
		try {
			const result = await addToWatchlistFn({
				data: {
					movie: {
						tmdbId: movie.id,
						title: movie.title,
						releaseDate: movie.release_date,
						posterPath: movie.poster_path,
					},
				},
			});
			toast.success(
				result === null ? "Already in your watchlist" : "Added to watchlist",
			);
			queryClient.invalidateQueries({
				queryKey: ["watchlist", "status", movie.id],
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
			onClick={() => movie && handleAddToWatchlist(movie)}
		>
			{isInWatchlist ? <ListCheck /> : <ListPlus />}
			{isInWatchlist ? "In watchlist" : "Add to watchlist"}
		</Button>
	);
}
