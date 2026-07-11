import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "../queries";
import type { TMDBMovieList } from "../types";
import { MovieCard } from "./MovieCard";
import { MoviesSectionSkeleton } from "./MoviesSectionSkeleton";

type MoviesSectionProps = {
	title: string;
	list: TMDBMovieList;
};

export function MoviesSection({ title, list }: MoviesSectionProps) {
	const { isPending, error, data } = useQuery(movieQueries.list(list));

	if (isPending) {
		return <MoviesSectionSkeleton />;
	}

	if (error)
		return <div className="p-4 text-red-500">Error loading {title}</div>;

	const movies = data.results || [];

	if (movies.length === 0) return null;

	return (
		<div className="relative flex flex-col gap-4">
			<h2 className="text-2xl tracking-tight font-medium">{title}</h2>
			<div className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory max-w">
				{movies.map((movie) => (
					<MovieCard
						key={movie.id}
						movie={movie}
						className="w-2xs shrink-0 snap-start"
					/>
				))}
			</div>
			<div className="absolute right-0 bottom-0 h-full w-24 bg-linear-to-l from-background via-background/30 to-transparent pointer-events-none" />
		</div>
	);
}
