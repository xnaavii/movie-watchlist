import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "#/components/ui/button";
import { MovieBanner } from "#/features/movies/components/MovieBanner";
import { MoviePoster } from "#/features/movies/components/MoviePoster";
import { getMovie } from "#/features/movies/server/movies.functions";

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
	const router = useRouter();

	if (!result.success) {
		return <div className="p-4 text-red-500">{result.error}</div>;
	}

	const movie = result.data;

	return (
		<MovieBanner backdropPath={movie.backdrop_path} title={movie.title}>
			<div className="absolute bottom-6 left-6 z-9 w-37.5 sm:w-50">
				<MoviePoster posterPath={movie.poster_path} title={movie.title} />
			</div>
			<div className="absolute top-6 left-6 z-9">
				<Button
					variant="ghost"
					className="bg-background/15 backdrop-blur-xl"
					onClick={() => router.history.back()}
				>
					<ChevronLeft />
					Go back
				</Button>
			</div>
		</MovieBanner>
	);
}
