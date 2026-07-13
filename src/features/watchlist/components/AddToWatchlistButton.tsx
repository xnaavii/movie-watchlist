import type { MovieDetails } from "@lorenzopant/tmdb";
import { useServerFn } from "@tanstack/react-start";
import { ListPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { addToWatchlist } from "../server/watchlist.functions";

type AddToWatchlistButtonProps = {
	movie: MovieDetails;
};

export function AddToWatchlistButton({ movie }: AddToWatchlistButtonProps) {
	const addToWatchlistFn = useServerFn(addToWatchlist);

	return (
		<Button
			className="w-fit"
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
				} catch {
					toast.error("Something went wrong. Please try again.");
				}
			}}
		>
			<ListPlus />
			Add to watchlist
		</Button>
	);
}