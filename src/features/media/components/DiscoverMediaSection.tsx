import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import type { DiscoverGenre } from "../genres";
import {
	type DiscoverSectionSlug,
	getDiscoverSection,
	sectionQuery,
} from "../sections";
import { MediaRow } from "./MediaRow";
import { MediaRowSkeleton } from "./MediaRowSkeleton";
import { SectionHeader } from "./SectionHeader";

interface DiscoverMediaSectionProps {
	section: DiscoverSectionSlug;
	genre?: DiscoverGenre;
	watchlistStatuses?: Record<string, WatchlistStatus>;
}

/**
 * A titled row of movies or TV shows that loads on its own, so a slow or
 * failing TMDB request only affects its own section instead of the whole page.
 */
export function DiscoverMediaSection(props: DiscoverMediaSectionProps) {
	return (
		<ErrorBoundary fallback={null}>
			<Suspense fallback={<MediaRowSkeleton />}>
				<DiscoverMediaSectionContent {...props} />
			</Suspense>
		</ErrorBoundary>
	);
}

function DiscoverMediaSectionContent({
	section,
	genre,
	watchlistStatuses,
}: DiscoverMediaSectionProps) {
	const { data } = useSuspenseInfiniteQuery(sectionQuery(section, genre));
	const details = getDiscoverSection(section, genre);
	const firstPage = data.pages[0];

	if (!details || !firstPage || firstPage.results.length === 0) return null;

	return (
		<section className="flex flex-col gap-4">
			<SectionHeader
				title={details.title}
				description={details.description}
				section={firstPage.total_pages > 1 ? section : undefined}
				genre={genre}
			/>
			<MediaRow
				items={firstPage.results}
				watchlistStatuses={watchlistStatuses}
			/>
		</section>
	);
}
