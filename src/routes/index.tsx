import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MoviesSection } from "#/features/movies/components/MoviesSection";
import { getPopularMovies } from "#/features/movies/utils/movies.functions";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const getPopularMoviesFn = useServerFn(getPopularMovies);

	return (
		<div className="p-8">
			<h1 className="text-4xl font-bold">Welcome to Movie watchlist</h1>
			<MoviesSection
				title="Popular"
				queryKey="popular"
				fetcher={() => getPopularMoviesFn()}
			/>
		</div>
	);
}
