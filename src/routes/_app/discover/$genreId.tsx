import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/discover/$genreId")({
	params: {
		priority: 10,
		parse: ({ genreId }) => {
			if (!/^\d+$/.test(genreId)) return false;
			return { genreId: Number(genreId) };
		},
	},
	component: DiscoverGenrePage,
});

function DiscoverGenrePage() {
	const { genreId } = Route.useParams();

	return <div>Hello "/_app/discover/{genreId}</div>;
}
