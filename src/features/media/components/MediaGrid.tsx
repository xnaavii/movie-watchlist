import type { WatchlistStatus } from "#/features/watchlist/types";
import type { MediaItem } from "../types";
import { mediaKey } from "../utils";
import { MediaCard } from "./MediaCard";

/**
 * The one poster grid layout: 3 columns on phones up to 6 on wide screens.
 * Every grid of titles (genres, search, watchlist, picks) and its skeleton
 * uses this, so the column count is the same on every page.
 */
export const MEDIA_GRID_CLASS =
	"grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4";

type MediaGridProps = {
	items: MediaItem[];
	watchlistStatuses?: Record<string, WatchlistStatus>;
};

export function MediaGrid({ items, watchlistStatuses }: MediaGridProps) {
	return (
		<ul className={MEDIA_GRID_CLASS}>
			{items.map((item) => (
				<li key={mediaKey(item)}>
					<MediaCard
						media={item}
						watchlistStatus={watchlistStatuses?.[mediaKey(item)]}
					/>
				</li>
			))}
		</ul>
	);
}
