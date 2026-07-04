import { createFileRoute } from "@tanstack/react-router";

import MoviesSection from "#/features/movies/components/MoviesSection";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="flex flex-col gap-8 p-6">
			<MoviesSection title="Popular" list="popular" />
			<MoviesSection title="In Theaters" list="now_playing" />
			<MoviesSection title="Upcoming" list="upcoming" />
			<MoviesSection title="Top Rated" list="top_rated" />
		</div>
	);
}
