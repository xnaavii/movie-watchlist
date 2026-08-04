import type {
	Movie,
	WatchlistStatus,
} from "#/features/watchlist/server/watchlist.server";
import { MovieCard } from "./MovieCard";

type MovieGridProps = {
	movies: Movie[];
	watchlistStatuses?: Record<number, WatchlistStatus>;
};

export function MovieGrid({ movies, watchlistStatuses }: MovieGridProps) {
	return (
		<ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
			{movies.map((movie) => (
				<li key={movie.id}>
					<MovieCard
						movie={movie}
						watchlistStatus={watchlistStatuses?.[movie.id]}
					/>
				</li>
			))}
		</ul>
	);
}
