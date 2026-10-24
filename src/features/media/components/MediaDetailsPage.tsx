import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { BackButtonView } from "#/components/BackButtonView";
import { Container } from "#/components/Container";
import { Button } from "#/components/ui/button";
import { AtmosFeedback } from "#/features/sound/components/AtmosFeedback";
import { TitleAtmosBadge } from "#/features/sound/components/TitleAtmosBadge";
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
import { MediaReviewsView } from "./MediaReviewsView";
import { MediaRowSkeleton } from "./MediaRowSkeleton";
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
			<div className="relative">
				<MediaBackdropImageView media={media} title={media.title} />
				<BackButtonView
					fallbackTo="/discover"
					className="absolute top-16 left-4 md:top-6 md:left-6 lg:top-8 lg:left-8 z-30"
				/>
				<div className="relative -mt-12 md:mt-0 md:absolute md:inset-0 flex flex-col md:justify-end px-4 md:p-6 lg:p-8 z-20">
					<div className="flex flex-col items-center md:items-start gap-8 text-center md:text-left">
						<MediaLogoView media={media} title={media.title} />
						<MediaDetailsView media={media} />
						<TitleAtmosBadge tmdbId={media.id} mediaType={media.mediaType} />
						<div className="flex flex-wrap justify-center md:justify-start gap-2">
							<WatchlistStatusButtonView media={media} />
							<JustWatchButton title={media.title} />
						</div>
					</div>
				</div>
			</div>

			<Container className="gap-12 md:gap-16 lg:gap-20 pb-16 md:pb-20 lg:pb-24">
				<MediaWhereToWatchView media={media} />
				{media.mediaType === "tv" && <TVSeasons show={media} />}
				{isReleased(media) && (
					<AtmosFeedback tmdbId={media.id} mediaType={media.mediaType} />
				)}
				<MediaTrailerView media={media} title={media.title} />
				<MediaGalleryView media={media} title={media.title} />
				<MediaCastView media={media} />
				<MediaFacts media={media} />
				<MediaReviewsView media={media} />
				<Suspense fallback={<MediaRowSkeleton />}>
					<RecommendedMediaView media={media} />
				</Suspense>
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
