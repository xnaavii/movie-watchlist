import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { MediaRow } from "#/features/media/components/MediaRow";
import { useMediaLogos } from "#/features/media/hooks/useMediaLogos";
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
	const logos = useMediaLogos(items);

	return (
		items.length > 0 && (
			<section className="flex flex-col gap-4">
				<div className="flex justify-between">
					<h2 className="text-xl lg:text-2xl tracking-tighter">
						In Your Watchlist
					</h2>
					<Button variant="link" asChild>
						<Link to="/watchlist" search={mediaType ? { type: mediaType } : {}}>
							See all
						</Link>
					</Button>
				</div>
				<MediaRow
					items={items}
					logos={logos}
					watchlistStatuses={watchlistStatuses}
				/>
			</section>
		)
	);
}
