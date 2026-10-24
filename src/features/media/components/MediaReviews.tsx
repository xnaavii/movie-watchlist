import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { Button } from "#/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
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
		<Carousel
			opts={{ align: "start", dragFree: true }}
			plugins={[WheelGesturesPlugin()]}
		>
			<section className="flex flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-2xl tracking-tighter">Reviews</h2>
					<div className="flex items-center gap-2">
						{totalResults > shownReviews.length && (
							<Button variant="link" asChild>
								<a
									href={getTmdbReviewsUrl(media)}
									target="_blank"
									rel="noopener noreferrer"
								>
									See all {totalResults} on TMDB
								</a>
							</Button>
						)}
						<CarouselPrevious className="static my-0 hidden sm:inline-flex" />
						<CarouselNext className="static my-0 hidden sm:inline-flex" />
					</div>
				</div>
				<CarouselContent className="-ml-6">
					{shownReviews.map((review) => (
						<CarouselItem
							key={review.id}
							className="pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
						>
							<MediaReviewCard review={review} />
						</CarouselItem>
					))}
				</CarouselContent>
			</section>
		</Carousel>
	);
}
