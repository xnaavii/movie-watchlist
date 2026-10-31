import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { PillNav, PillNavItem } from "#/components/PillNav";
import { MediaGrid } from "#/features/media/components/MediaGrid";
import type { DiscoverGenre } from "#/features/media/genres";
import { mediaQueries } from "#/features/media/queries";
import type { MediaType } from "#/features/media/types";
import { uniqueMedia } from "#/features/media/utils";
import type { WatchlistStatus } from "#/features/watchlist/types";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { MEDIA_TYPE_CONFIG } from "../mediaTypes";

export interface PopularInGenreProps {
	genre: DiscoverGenre;
	mediaType: MediaType;
	mediaTypes: MediaType[];
	watchlistStatuses?: Record<string, WatchlistStatus>;
}

/** An endless grid of the genre's popular titles, one type at a time. */
export function PopularInGenre({
	genre,
	mediaType,
	mediaTypes,
	watchlistStatuses,
}: PopularInGenreProps) {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
	} = useSuspenseInfiniteQuery(mediaQueries.popularInGenre(genre, mediaType));

	const items = useMemo(() => uniqueMedia(data.pages), [data]);

	const sentinelRef = useInfiniteScrollTrigger({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		itemCount: items.length,
		disabled: isFetchNextPageError,
	});

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<h2 className="text-xl lg:text-2xl tracking-tighter">
					Popular {genre.name}
				</h2>
				{mediaTypes.length > 1 && (
					<PillNav aria-label={`Popular ${genre.name} type`}>
						{mediaTypes.map((type) => (
							<PillNavItem key={type} asChild active={type === mediaType}>
								<Link
									to="/discover/$genreSlug"
									params={{ genreSlug: genre.slug }}
									search={{ type }}
									replace
									resetScroll={false}
								>
									{MEDIA_TYPE_CONFIG[type].pluralLabel}
								</Link>
							</PillNavItem>
						))}
					</PillNav>
				)}
			</div>
			<MediaGrid items={items} watchlistStatuses={watchlistStatuses} />
			<InfiniteScrollFooter
				ref={sentinelRef}
				isFetchingNextPage={isFetchingNextPage}
				isError={isFetchNextPageError}
				onRetry={() => fetchNextPage()}
			/>
		</section>
	);
}
