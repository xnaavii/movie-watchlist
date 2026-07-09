import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FeaturedMovies } from "#/features/movies/components/FeaturedMovies";
import { FeaturedMoviesSkeleton } from "#/features/movies/components/FeaturedMoviesSkeleton";
import { MoviesSection } from "#/features/movies/components/MoviesSection";
import { movieQueries } from "#/features/movies/queries";

export const Route = createFileRoute("/explore")({
	component: ExplorePage,
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(movieQueries.list("now_playing"));
	},
});

function ExplorePage() {
	const { data, isPending, isError, error } = useSuspenseQuery(
		movieQueries.list("now_playing"),
	);

	return (
		<div className="flex flex-col gap-8">
			{isPending ? (
				<FeaturedMoviesSkeleton />
			) : isError ? (
				<p>{error.message}</p>
			) : (
				<FeaturedMovies movies={data.results} />
			)}
			<div className="flex flex-col gap-20 p-6">
				<MoviesSection title="Popular" list="popular" />
				<MoviesSection title="In Theaters" list="now_playing" />
				<MoviesSection title="Upcoming" list="upcoming" />
				<MoviesSection title="Top Rated" list="top_rated" />
			</div>
		</div>
	);
}
