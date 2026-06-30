import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import MovieCard from "#/features/movies/components/MovieCard";
import { getMovie } from "#/features/movies/utils/movies.functions";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const getMovieFn = useServerFn(getMovie);

	const { isPending, error, data } = useQuery({
		queryKey: ["movie"],
		queryFn: () => getMovieFn({ data: { id: 2 } }),
	});

	if (isPending) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>There was an error: {error.message}</p>;
	}

	if (data?.success) {
		const movie = data?.data;

		return (
			<div className="p-8">
				<h1 className="text-4xl font-bold">Welcome to Movie watchlist</h1>
				<div className="grid gap-4 grid-cols-8">
					<MovieCard
						id={movie.id}
						imageSrc={movie.poster_path}
						title={movie.title}
					/>
				</div>
			</div>
		);
	}
}
