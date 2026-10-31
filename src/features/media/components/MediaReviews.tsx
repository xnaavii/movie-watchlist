import { RowCarousel } from "#/components/RowCarousel";
import { Button } from "#/components/ui/button";
import { CarouselItem } from "#/components/ui/carousel";
import type { MediaRef, MediaReview } from "../types";
import { getTmdbReviewsUrl } from "../utils/tmdb";
import { MediaReviewCard } from "./MediaReviewCard";

const MAX_REVIEWS = 12;

interface MediaReviewsProps {
	media: MediaRef;
	reviews: MediaReview[];
	totalResults: number;
}

export function MediaReviews({
	media,
	reviews,
	totalResults,
}: MediaReviewsProps) {
	const shownReviews = reviews.slice(0, MAX_REVIEWS);

	return (
		<section>
			<RowCarousel
				header={<h2 className="text-2xl tracking-tighter">Reviews</h2>}
				actions={
					totalResults > shownReviews.length && (
						<Button variant="link" asChild className="px-0">
							<a
								href={getTmdbReviewsUrl(media)}
								target="_blank"
								rel="noopener noreferrer"
							>
								See all {totalResults} on TMDB
							</a>
						</Button>
					)
				}
			>
				{shownReviews.map((review) => (
					<CarouselItem
						key={review.id}
						className="pl-4 basis-[85%] sm:basis-[46%] lg:basis-[31%] 2xl:basis-[24%]"
					>
						<MediaReviewCard review={review} />
					</CarouselItem>
				))}
			</RowCarousel>
		</section>
	);
}
