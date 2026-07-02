import { useQuery } from "@tanstack/react-query";
import type { TmdbMovie, TmdbResult } from "../types";
import MovieList from "./MovieList";
import MoviesSectionSkeleton from "./MoviesSectionSkeleton";

interface MoviesSectionProps {
	title: string;
	queryKey: string;
	fetcher: () => Promise<TmdbResult<TmdbMovie>>;
}

export const MoviesSection = ({
	title,
	queryKey,
	fetcher,
}: MoviesSectionProps) => {
	const { isPending, error, data } = useQuery({
		queryKey: ["movies", queryKey],
		queryFn: fetcher,
	});

	if (isPending) {
		return <MoviesSectionSkeleton />;
	}

	if (error)
		return <div className="p-4 text-red-500">Error loading {title}</div>;

	const movies = data?.success ? data.data.results : [];

	if (movies.length === 0) return null;

	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-2xl tracking-tight font-medium">{title}</h2>
			<MovieList movies={movies} />
		</div>
	);
};
