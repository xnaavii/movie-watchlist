import {
	useQueryClient,
	useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LazySection } from "#/components/LazySection";
import type { WatchlistStatus } from "#/features/watchlist/types";
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
 * It fetches once it scrolls near the visible area, unless already cached.
 */
export function DiscoverMediaSection(props: DiscoverMediaSectionProps) {
	const queryClient = useQueryClient();
	const isCached =
		queryClient.getQueryData(
			sectionQuery(props.section, props.genre).queryKey,
		) !== undefined;

	return (
		<ErrorBoundary fallback={null}>
			<LazySection eager={isCached} fallback={<MediaRowSkeleton />}>
				<Suspense fallback={<MediaRowSkeleton />}>
					<DiscoverMediaSectionContent {...props} />
				</Suspense>
			</LazySection>
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
		<section>
			<MediaRow
				header={
					<SectionHeader
						title={details.title}
						description={details.description}
						section={firstPage.total_pages > 1 ? section : undefined}
						genre={genre}
					/>
				}
				items={firstPage.results}
				watchlistStatuses={watchlistStatuses}
			/>
		</section>
	);
}
