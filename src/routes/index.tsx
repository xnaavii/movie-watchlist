import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MoviesGrid } from "#/features/movies/components/MoviesGrid";
import type { TmdbMovie } from "#/features/movies/types";
import { getPopularMovies } from "#/features/movies/utils/movies.functions";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const getPopularMoviesFn = useServerFn(getPopularMovies);

	const { isPending, error, data } = useQuery({
		queryKey: ["movies"],
		queryFn: () => getPopularMoviesFn({ data: { page: 1 } }),
	});

	if (isPending) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>There was an error: {error.message}</p>;
	}

	if (data?.success) {
		const movies: TmdbMovie[] = data.data.results;

		return (
			<div className="p-8">
				<h1 className="text-4xl font-bold">Welcome to Movie watchlist</h1>
				<MoviesGrid movies={movies} />
			</div>
		);
	}
}
