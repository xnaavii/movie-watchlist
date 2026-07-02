import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AspectRatio } from "#/components/ui/aspect-ratio";
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
	const posterImage = getMovieImage(movie.poster_path, "w342");

	return (
		<div className="relative w-full min-h-100 h-[60vh] bg-neutral-950">
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
			<div className="absolute bottom-6 left-6 translate-y-1/4 z-9 w-37.5 sm:w-50">
				<AspectRatio
					ratio={2 / 3}
					className="relative rounded-lg overflow-hidden bg-muted"
				>
					{posterImage ? (
						<img
							src={posterImage}
							alt={movie.title}
							className="absolute inset-0 size-full object-cover"
						/>
					) : (
						<div className="absolute inset-0 bg-muted flex items-center justify-center text-xl text-muted-foreground">
							No image
						</div>
					)}
				</AspectRatio>
			</div>
		</div>
	);
}
