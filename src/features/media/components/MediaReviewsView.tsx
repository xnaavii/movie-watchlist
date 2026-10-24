import { useQuery } from "@tanstack/react-query";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { normalizeReview } from "../utils";
import { MediaReviews } from "./MediaReviews";
import { MediaReviewsSkeleton } from "./MediaReviewsSkeleton";

interface MediaReviewsViewProps {
	media: MediaRef;
}

export function MediaReviewsView({ media }: MediaReviewsViewProps) {
	const {
		data: reviews,
		isLoading,
		isError,
		error,
	} = useQuery({
		...mediaQueries.reviews(media),
		select: (data) => ({
			results: data.results.map(normalizeReview),
			totalResults: data.total_results,
		}),
	});

	if (isLoading) {
		return <MediaReviewsSkeleton />;
	}

	if (isError) {
		return (
			<p>There was an error getting the reviews. Error: {error.message}</p>
		);
	}

	if (!reviews || reviews.results.length === 0) return null;

	return (
		<MediaReviews
			media={media}
			reviews={reviews.results}
			totalResults={reviews.totalResults}
		/>
	);
}
