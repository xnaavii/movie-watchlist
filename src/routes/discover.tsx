import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FeaturedMovies } from "#/features/movies/components/FeaturedMovies";
import { MoviesSection } from "#/features/movies/components/MoviesSection";
import { movieQueries } from "#/features/movies/queries";

export const Route = createFileRoute("/discover")({
	component: DiscoverPage,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(movieQueries.list("now_playing")),
});

function DiscoverPage() {
	const { data } = useSuspenseQuery(movieQueries.list("now_playing"));

	return (
		<div className="flex flex-col gap-6">
			<FeaturedMovies movies={data.results} />
			<div className="flex flex-col gap-20 p-2 md:p-6">
				<MoviesSection title="Popular" list="popular" />
				<MoviesSection title="In Theaters" list="now_playing" />
				<MoviesSection title="Upcoming" list="upcoming" />
				<MoviesSection title="Top Rated" list="top_rated" />
			</div>
		</div>
	);
}
