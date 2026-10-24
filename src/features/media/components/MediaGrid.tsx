import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import type { MediaItem } from "../types";
import { mediaKey } from "../utils";
import { MediaCard } from "./MediaCard";

type MediaGridProps = {
	items: MediaItem[];
	watchlistStatuses?: Record<string, WatchlistStatus>;
};

export function MediaGrid({ items, watchlistStatuses }: MediaGridProps) {
	return (
		<ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
