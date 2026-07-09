import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { HeroSlideshow } from "#/features/movies/components/HeroSlideshow";
import { MoviesSection } from "#/features/movies/components/MoviesSection";
import { movieQueries } from "#/features/movies/queries";

export const Route = createFileRoute("/explore")({
	component: Explore,
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(movieQueries.list("now_playing"));
	},
});

function Explore() {
	return (
		<div className="flex flex-col gap-8">
			<HeroSlideshow />
			<div className="flex flex-col gap-20 p-6">
				<MoviesSection title="Popular" list="popular" />
				<MoviesSection title="In Theaters" list="now_playing" />
				<MoviesSection title="Upcoming" list="upcoming" />
				<MoviesSection title="Top Rated" list="top_rated" />
			</div>
		</div>
	);
}
