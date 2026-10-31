import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { Container } from "#/components/Container";
import { LazySection } from "#/components/LazySection";
import { Button } from "#/components/ui/button";
import { AtmosFeedback } from "#/features/sound/components/AtmosFeedback";
import { WatchlistStatusButtonView } from "#/features/watchlist/components/WatchlistStatusButton";
import { mediaQueries } from "../queries";
import type { MediaRef, MediaType } from "../types";
import { isReleased } from "../utils";
import { JustWatchButton } from "./JustWatchButton";
import { MediaBackdropImageView } from "./MediaBackdropImageView";
import { MediaCastView } from "./MediaCastView";
import { MediaDetailsView } from "./MediaDetailsView";
import { MediaFacts } from "./MediaFacts";
import { MediaGalleryView } from "./MediaGalleryView";
import { MediaLogoView } from "./MediaLogoView";
import { MediaReviewsSkeleton } from "./MediaReviewsSkeleton";
import { MediaReviewsView } from "./MediaReviewsView";
import { MediaRowSkeleton } from "./MediaRowSkeleton";
import { MediaTrailerSkeleton } from "./MediaTrailerSkeleton";
import { MediaTrailerView } from "./MediaTrailerView";
import { MediaWhereToWatchView } from "./MediaWhereToWatchView";
import { RecommendedMediaView } from "./RecommendedMediaView";
import { TVSeasons } from "./TVSeasons";

/** The details page shared by movies and TV shows. */
export function MediaDetailsPage({ media: ref }: { media: MediaRef }) {
	const { data: media } = useSuspenseQuery(mediaQueries.details(ref));

	return (
		<div
			className="flex flex-col gap-6 relative"
			key={`${media.mediaType}:${media.id}`}
		>
			{/* The hero grows with its content instead of squeezing it into the
			    backdrop, so titles with lots of detail keep the same rhythm. */}
			<section className="relative md:min-h-svh md:flex md:flex-col md:justify-end">
				<div className="md:absolute md:inset-0">
					<MediaBackdropImageView media={media} title={media.title} />
				</div>
				<div className="relative z-20 -mt-12 md:mt-0 px-4 md:px-6 lg:px-8 md:pt-28 md:pb-10 lg:pb-14">
					<div className="flex flex-col items-center md:items-start gap-6 md:gap-8 text-center md:text-left max-w-2xl mx-auto md:mx-0">
						<MediaLogoView
							media={media}
							title={media.title}
							imageClassName="w-auto h-auto max-w-[clamp(12rem,24vw,22rem)] max-h-[clamp(4.5rem,16vh,9rem)]"
						/>
						<MediaDetailsView media={media} />
						<div className="flex flex-wrap justify-center md:justify-start gap-2">
							<WatchlistStatusButtonView media={media} />
							<JustWatchButton title={media.title} />
						</div>
					</div>
				</div>
			</section>

			<Container className="gap-12 md:gap-16 lg:gap-20 pb-16 md:pb-20 lg:pb-24">
				<MediaWhereToWatchView media={media} />
				{media.mediaType === "tv" && <TVSeasons show={media} />}
				{isReleased(media) && (
					<AtmosFeedback tmdbId={media.id} mediaType={media.mediaType} />
				)}
				{/* Sections below the fold fetch only once they scroll into view. */}
				<LazySection fallback={<MediaTrailerSkeleton />}>
					<MediaTrailerView media={media} title={media.title} />
				</LazySection>
				<LazySection fallback={null}>
					<MediaGalleryView media={media} title={media.title} />
				</LazySection>
				<MediaCastView media={media} />
				<MediaFacts media={media} />
				<LazySection fallback={<MediaReviewsSkeleton />}>
					<MediaReviewsView media={media} />
				</LazySection>
				<LazySection fallback={<MediaRowSkeleton />}>
					<Suspense fallback={<MediaRowSkeleton />}>
						<RecommendedMediaView media={media} />
					</Suspense>
				</LazySection>
			</Container>
		</div>
	);
}

export function MediaDetailsPagePending() {
	return (
		<div className="flex flex-col gap-20 animate-pulse">
			<div className="w-full h-[clamp(30vh,80vh+10svh,90vh)] bg-muted" />
		</div>
	);
}

const NOT_FOUND_LABELS: Record<MediaType, string> = {
	movie: "movie",
	tv: "TV show",
};

export function MediaDetailsPageNotFound({
	mediaType,
}: {
	mediaType: MediaType;
}) {
	const label = NOT_FOUND_LABELS[mediaType];

	return (
		<div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-center px-4">
			<h1 className="text-3xl font-medium tracking-tighter first-letter:uppercase">
				{label} not found
			</h1>
			<p className="text-muted-foreground">
				We couldn't find that {label}. It may have been removed or the link is
				incorrect.
			</p>
			<Button asChild>
				<Link to="/discover">Back to Discover</Link>
			</Button>
		</div>
	);
}
