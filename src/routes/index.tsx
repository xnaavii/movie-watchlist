import { createFileRoute } from "@tanstack/react-router";

import { MoviesSection } from "#/features/movies/components/MoviesSection";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	// TODO: Show other sections

	return (
		<div className="p-6">
			<MoviesSection title="Popular" list="popular" />
			<MoviesSection title="Top Rated" list="top_rated" />
		</div>
	);
}
