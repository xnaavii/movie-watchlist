import { useQuery } from "@tanstack/react-query";
import type { TmdbMovie, TmdbResult } from "../types";
import MovieCardSkeleton from "./MovieCardSkeleton";
import MovieList from "./MovieList";

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
		const skeletonItems = Array.from({ length: 10 }, (_, i) => ({
			id: `skeleton-${queryKey}-${i}`,
		}));

		return (
			<div>
				<div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />

				<div className="flex gap-4 overflow-x-hidden pb-4">
					{skeletonItems.map((item) => (
						<div key={item.id} className="w-37.5 sm:w-50 shrink-0">
							<MovieCardSkeleton />
						</div>
					))}
				</div>
			</div>
		);
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
