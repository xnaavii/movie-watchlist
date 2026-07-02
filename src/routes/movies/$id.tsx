import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getMovie } from "#/features/movies/server/movies.functions";
import { getMovieImage } from "#/features/movies/utils/tmdb";

const movieQuery = (id: number) =>
	queryOptions({
		queryKey: ["movie", id],
		queryFn: () => getMovie({ data: { id } }),
	});

export const Route = createFileRoute("/movies/$id")({
	component: Movie,
	loader: ({ params, context }) => {
		return context.queryClient.ensureQueryData(movieQuery(Number(params.id)));
	},
});

function Movie() {
	const { id } = Route.useParams();
	const { data: result } = useSuspenseQuery(movieQuery(Number(id)));

	if (!result.success) {
		return <div className="p-4 text-red-500">{result.error}</div>;
	}

	const movie = result.data;
	const backdropImage = getMovieImage(movie.backdrop_path);

	return (
		<div className="relative w-full min-h-150 h-[60vh] bg-neutral-950 overflow-hidden">
			<div className="absolute top-0 left-0 size-full bg-linear-to-t from-black to-transparent z-1" />
			{backdropImage ? (
				<img
					src={backdropImage}
					alt={movie.title}
					className="absolute size-full object-cover"
				/>
			) : (
				<p>
					<div className="absolute top-0 left-0 w-full h-full bg-muted aspect-2/3 flex items-center justify-center text-xl text-muted-foreground">
						No image
					</div>
				</p>
			)}
		</div>
	);
}
