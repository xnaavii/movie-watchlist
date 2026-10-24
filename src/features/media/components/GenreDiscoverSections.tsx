import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { listDiscoverSections, type SectionGenre } from "../sections";
import { DiscoverMediaSection } from "./DiscoverMediaSection";

interface GenreDiscoverSectionsProps {
	genre: SectionGenre;
	watchlistStatuses?: Record<string, WatchlistStatus>;
}

/** The discover page's curated rows, narrowed down to a single genre. */
export function GenreDiscoverSections({
	genre,
	watchlistStatuses,
}: GenreDiscoverSectionsProps) {
	return listDiscoverSections(genre).map(({ slug }) => (
		<DiscoverMediaSection
			key={slug}
			section={slug}
			genre={genre}
			watchlistStatuses={watchlistStatuses}
		/>
	));
}
