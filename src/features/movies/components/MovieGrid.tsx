import type { MovieResultItem } from "@lorenzopant/tmdb";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { MovieCard } from "./MovieCard";

type MovieGridProps = {
	movies: MovieResultItem[];
	watchlistStatuses?: Record<number, WatchlistStatus>;
};

export function MovieGrid({ movies, watchlistStatuses }: MovieGridProps) {
	return (
		<ul className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
			{movies.map((movie) => (
				<li key={movie.id}>
					<MovieCard
						id={movie.id}
						posterPath={movie.poster_path ?? null}
						releaseDate={movie.release_date}
						title={movie.title}
						watchlistStatus={watchlistStatuses?.[movie.id]}
					/>
				</li>
			))}
		</ul>
	);
}
