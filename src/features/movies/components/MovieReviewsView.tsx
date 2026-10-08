import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "../queries";
import { normalizeReview } from "../utils";
import { MovieReviews } from "./MovieReviews";
import { MovieReviewsSkeleton } from "./MovieReviewsSkeleton";

interface MovieReviewsViewProps {
	movieId: number;
}

export function MovieReviewsView({ movieId }: MovieReviewsViewProps) {
	const {
		data: reviews,
		isLoading,
		isError,
		error,
	} = useQuery({
		...movieQueries.reviews({ movie_id: movieId }),
		select: (data) => ({
			results: data.results.map(normalizeReview),
			totalResults: data.total_results,
		}),
	});

	if (isLoading) {
		return <MovieReviewsSkeleton />;
	}

	if (isError) {
		return (
			<p>
				There was an error getting the movie reviews. Error: {error.message}
			</p>
		);
	}

	if (!reviews || reviews.results.length === 0) return null;

	return (
		<MovieReviews
			movieId={movieId}
			reviews={reviews.results}
			totalResults={reviews.totalResults}
		/>
	);
}
