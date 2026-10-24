import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { listDiscoverSections, type SectionGenre } from "../sections";
import { DiscoverMovieSection } from "./DiscoverMovieSection";

interface GenreDiscoverSectionsProps {
	genre: SectionGenre;
	watchlistStatuses?: Record<number, WatchlistStatus>;
}

/** The discover page's curated rows, narrowed down to a single genre. */
export function GenreDiscoverSections({
	genre,
	watchlistStatuses,
}: GenreDiscoverSectionsProps) {
	return listDiscoverSections(genre).map(({ slug }) => (
		<DiscoverMovieSection
			key={slug}
			section={slug}
			genre={genre}
			watchlistStatuses={watchlistStatuses}
		/>
	));
}
