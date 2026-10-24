import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import {
	type DiscoverSectionSlug,
	getDiscoverSection,
	type SectionGenre,
	sectionQuery,
} from "../sections";
import { normalizeMovie } from "../utils";
import { MovieRow } from "./MovieRow";
import { MovieRowSkeleton } from "./MovieRowSkeleton";
import { SectionHeader } from "./SectionHeader";

interface DiscoverMovieSectionProps {
	section: DiscoverSectionSlug;
	genre?: SectionGenre;
	watchlistStatuses?: Record<number, WatchlistStatus>;
}

/**
 * A titled movie row that loads on its own, so a slow or failing TMDB request
 * only affects its own section instead of the whole discover page.
 */
export function DiscoverMovieSection(props: DiscoverMovieSectionProps) {
	return (
		<ErrorBoundary fallback={null}>
			<Suspense fallback={<MovieRowSkeleton />}>
				<DiscoverMovieSectionContent {...props} />
			</Suspense>
		</ErrorBoundary>
	);
}

function DiscoverMovieSectionContent({
	section,
	genre,
	watchlistStatuses,
}: DiscoverMovieSectionProps) {
	const { data } = useSuspenseInfiniteQuery(sectionQuery(section, genre?.id));
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
			<MovieRow
				movies={firstPage.results.map((movie) => normalizeMovie(movie))}
				watchlistStatuses={watchlistStatuses}
			/>
		</section>
	);
}
