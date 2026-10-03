import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "@/features/movies/queries";
import { MovieCredits } from "./MovieCredits";

interface MovieCreditsViewProps {
	movieId: number;
}

export function MovieCreditsView({ movieId }: MovieCreditsViewProps) {
	const {
		data: credits,
		isLoading,
		isError,
		error,
	} = useQuery(movieQueries.credits({ movie_id: movieId }));

	if (isLoading) {
		return <span className="bg-muted animate-pulse w-24 h-5 rounded"></span>;
	}

	if (isError) {
		return <p>{error.message ?? "There was error getting movie credits."}</p>;
	}

	if (!credits) {
		return <p>There are no credits available for this title.</p>;
	}

	return <MovieCredits credits={credits} />;
}
