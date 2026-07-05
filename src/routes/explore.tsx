import { createFileRoute } from "@tanstack/react-router";
import { HeroSlideshow } from "#/features/movies/components/HeroSlideshow";
import { MoviesSection } from "#/features/movies/components/MoviesSection";

export const Route = createFileRoute("/explore")({
	component: Explore,
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
