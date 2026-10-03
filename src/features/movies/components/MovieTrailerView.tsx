import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "../queries";
import { MovieTrailer } from "./MovieTrailer";
import { MovieTrailerEmpty } from "./MovieTrailerEmpty";
import { MovieTrailerSkeleton } from "./MovieTrailerSkeleton";

interface MovieTrailerViewProps {
	movieId: number;
	movieTitle: string;
}

export function MovieTrailerView({
	movieId,
	movieTitle,
}: MovieTrailerViewProps) {
	const {
		data: videos,
		isLoading,
		isError,
		error,
	} = useQuery(movieQueries.videos({ movie_id: movieId }));

	if (isLoading) {
		return <MovieTrailerSkeleton />;
	}

	if (isError) {
		return (
			<p>
				There was an error getting the movie trailer. Error: {error.message}
			</p>
		);
	}

	const trailer = videos?.results.find((v) => v.type === "Trailer");

	if (!trailer) {
		return <MovieTrailerEmpty />;
	}

	return (
		<section className="flex flex-col gap-4">
			<h2 className="text-2xl tracking-tighter">Watch the Trailer</h2>
			<MovieTrailer trailerId={trailer.key} title={movieTitle} />
		</section>
	);
}
