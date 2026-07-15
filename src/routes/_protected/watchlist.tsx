import { createFileRoute } from "@tanstack/react-router";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { getUserWatchlist } from "#/features/watchlist/server/watchlist.functions";

export const Route = createFileRoute("/_protected/watchlist")({
	component: WatchlistPage,
	loader: () => getUserWatchlist(),
});

function WatchlistPage() {
	const watchlistItems = Route.useLoaderData();

	return (
		<div className="mt-16 p-2 md:p-6 md:mt-0 flex flex-col gap-8">
			<h1 className="font-semibold text-3xl md:text-4xl min-w-0">
				Your Watchlist
			</h1>

			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
				{watchlistItems.map((item) => (
					<MovieCard
						key={item.movie.id}
						id={item.movie.tmdbId}
						title={item.movie.title}
						posterPath={item.movie.posterPath}
						releaseDate={item.movie.releaseDate}
					/>
				))}
			</div>
		</div>
	);
}
