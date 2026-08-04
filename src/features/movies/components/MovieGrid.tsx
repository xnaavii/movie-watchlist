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
		<ul className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
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
