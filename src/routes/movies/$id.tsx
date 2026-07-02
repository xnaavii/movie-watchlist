import { createFileRoute } from "@tanstack/react-router";
import { getMovie } from "#/features/movies/utils/movies.functions";

export const Route = createFileRoute("/movies/$id")({
	component: Movie,
	loader: async ({ params }) => getMovie({ data: { id: Number(params.id) } }),
});

function Movie() {
	const result = Route.useLoaderData();

	if (!result.success) {
		return <div className="p-4 text-red-500">{result.error}</div>;
	}

	const movie = result.data;

	console.log(movie);

	return (
		<div>
			<h1>{movie.title}</h1>
		</div>
	);
}
