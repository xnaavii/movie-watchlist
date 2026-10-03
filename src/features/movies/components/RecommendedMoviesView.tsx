import { useSuspenseQuery } from "@tanstack/react-query";
import { movieQueries } from "../queries";
import { normalizeMovie } from "../utils";
import { MovieRow } from "./MovieRow";
import { MovieRowSkeleton } from "./MovieRowSkeleton";

interface RecommendedMoviesProps {
	movieId: number;
}

export function RecommendedMoviesView({ movieId }: RecommendedMoviesProps) {
	const {
		data: recommendedMovies,
		isLoading,
		isError,
		error,
	} = useSuspenseQuery(movieQueries.recommendations({ movie_id: movieId }));

	if (isLoading) {
		return <MovieRowSkeleton />;
	}

	if (isError)
		return (
			<p className="text-red-500">
				{error.message ?? "There was an error getting the recommended movies."}
			</p>
		);

	if (!recommendedMovies) {
		return <p>There are no recommneded movies available for this title.</p>;
	}

	const movies = recommendedMovies?.results || [];

	if (movies.length === 0) return null;

	return (
		<section className="flex flex-col gap-4">
			<h2 className="text-2xl tracking-tighter">
				Similar movie recommendations
			</h2>
			<MovieRow
				movies={recommendedMovies.results.map((movie) => normalizeMovie(movie))}
			/>
		</section>
	);
}
