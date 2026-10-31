import type { WatchlistStatus } from "#/features/watchlist/types";
import type { DiscoverGenre } from "../genres";
import { listDiscoverSections } from "../sections";
import { DiscoverMediaSection } from "./DiscoverMediaSection";

interface GenreDiscoverSectionsProps {
	genre: DiscoverGenre;
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
