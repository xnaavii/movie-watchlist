import type { TmdbMovie } from "../types";
import MovieCard from "./MovieCard";

type MovieListProps = {
	movies: TmdbMovie[];
};

export default function MovieList({ movies }: MovieListProps) {
	return (
		<div className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory">
			{movies.map((movie) => (
				<div key={movie.id} className="w-37.5 sm:w-50 shrink-0 snap-start">
					<MovieCard
						id={movie.id}
						imageSrc={movie.poster_path}
						title={movie.title}
					/>
				</div>
			))}
		</div>
	);
}
