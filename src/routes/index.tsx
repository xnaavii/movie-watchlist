import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { MoviesSection } from "#/features/movies/components/MoviesSection";
import { getPopularMovies } from "#/features/movies/server/movies.functions";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const getPopularMoviesFn = useServerFn(getPopularMovies);

	return (
		<div className="p-6">
			<MoviesSection
				title="Popular"
				queryKey="popular"
				fetcher={() => getPopularMoviesFn()}
			/>
		</div>
	);
}
