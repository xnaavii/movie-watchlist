import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { MediaRow } from "#/features/media/components/MediaRow";
import { useMediaLogos } from "#/features/media/hooks/useMediaLogos";
import { watchlistQueries } from "@/features/watchlist/queries";

export function WatchlistMoviesView() {
	const { data: userWatchlist } = useSuspenseQuery(watchlistQueries.list());
	const { data: watchlistStatuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const watchlistMovies = userWatchlist.results.map(({ media }) => media);
	const watchlistMoviesLogos = useMediaLogos(watchlistMovies);

	return (
		watchlistMovies?.length > 0 && (
			<section className="flex flex-col gap-4">
				<div className="flex justify-between">
					<h2 className="text-xl lg:text-2xl tracking-tighter">
						In Your Watchlist
					</h2>
					<Button variant="link" asChild>
						<Link to="/watchlist">See all</Link>
					</Button>
				</div>
				<MediaRow
					items={watchlistMovies}
					logos={watchlistMoviesLogos}
					watchlistStatuses={watchlistStatuses}
				/>
			</section>
		)
	);
}
