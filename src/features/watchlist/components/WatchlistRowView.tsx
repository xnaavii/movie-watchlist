import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { MediaRow } from "#/features/media/components/MediaRow";
import type { MediaType } from "#/features/media/types";
import { watchlistQueries } from "@/features/watchlist/queries";

interface WatchlistRowViewProps {
	/** Only show saved titles of this type. */
	mediaType?: MediaType;
}

export function WatchlistRowView({ mediaType }: WatchlistRowViewProps) {
	const { data: userWatchlist } = useSuspenseQuery(watchlistQueries.list());
	const { data: watchlistStatuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const items = userWatchlist.results
		.map(({ media }) => media)
		.filter((media) => !mediaType || media.mediaType === mediaType);

	return (
		items.length > 0 && (
			<section>
				<MediaRow
					header={
						<div className="flex items-end justify-between gap-4">
							<h2 className="text-xl lg:text-2xl tracking-tighter">
								In Your Watchlist
							</h2>
							<Button variant="link" asChild className="shrink-0 px-0">
								<Link
									to="/watchlist"
									search={mediaType ? { type: mediaType } : {}}
								>
									See all
								</Link>
							</Button>
						</div>
					}
					items={items}
					watchlistStatuses={watchlistStatuses}
				/>
			</section>
		)
	);
}
