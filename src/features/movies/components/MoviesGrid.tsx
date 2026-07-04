import type { TmdbMovie } from "../types";
import { MovieCard } from "./MovieCard";

type MoviesGridProps = {
	movies: TmdbMovie[];
};

export function MoviesGrid({ movies }: MoviesGridProps) {
	return (
		<ul className="grid gap-4 grid-cols-8 overflow-x-hidden">
			{movies.map((movie) => (
				<li key={movie.id}>
					<MovieCard
						id={movie.id}
						imageSrc={movie.poster_path}
						title={movie.title}
					/>
				</li>
			))}
		</ul>
	);
}
