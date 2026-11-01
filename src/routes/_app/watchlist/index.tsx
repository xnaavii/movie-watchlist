import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BrandedTitle } from "#/components/BrandedTitle";
import { Container } from "#/components/Container";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { MediaCard } from "#/features/media/components/MediaCard";
import {
	MediaFilterBar,
	type MediaFilterValues,
} from "#/features/media/components/MediaFilterBar";
import { MEDIA_GRID_CLASS } from "#/features/media/components/MediaGrid";
import { mediaKey } from "#/features/media/utils";
import {
	hasActiveFilters,
	WATCHLIST_SORTS,
	type WatchlistFilters,
	watchlistFilterSearchSchema,
} from "#/features/media/utils/filters";
import { WatchlistPageSkeleton } from "#/features/watchlist/components/WatchlistPageSkeleton";
import { GuestSyncCallout } from "#/features/watchlist/guest/GuestSyncCallout";
import { watchlistQueries } from "#/features/watchlist/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { getErrorMessage } from "#/lib/utils";
import { pageHead, pageTitle } from "#/utils/seo";

export const Route = createFileRoute("/_app/watchlist/")({
	component: WatchlistPage,
	head: () =>
		pageHead({
			title: pageTitle("Your watchlist"),
			description:
				"What you're watching, what's next, and what you've finished. Movies and TV in one list.",
			noindex: true,
		}),
	validateSearch: watchlistFilterSearchSchema,
	loaderDeps: ({ search }) => search,
	pendingComponent: WatchlistPageSkeleton,
	errorComponent: ({ error }) => (
		<div className="p-2 md:p-4 lg:p-8">
			<p className="text-destructive">
				Failed to load your watchlist: {getErrorMessage(error)}
			</p>
		</div>
	),
	loader: async ({ context, deps }) => {
		await context.queryClient.infiniteQuery({
			...watchlistQueries.infiniteList(deps),
			staleTime: "static",
		});
	},
});

function WatchlistPage() {
	const filters = Route.useSearch();
	const navigate = Route.useNavigate();
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
	} = useSuspenseInfiniteQuery(watchlistQueries.infiniteList(filters));

	// Pages are offset based, so a title can show up twice if the list changes
	// while paging. Keep the first copy of each.
	const items = Array.from(
		new Map(
			data.pages
				.flatMap((page) => page.results)
				.map((item) => [mediaKey(item.media), item]),
		).values(),
	);
	const { data: statuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);

	const sentinelRef = useInfiniteScrollTrigger({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		itemCount: items.length,
		disabled: isFetchNextPageError,
	});

	function updateFilters(patch: MediaFilterValues) {
		navigate({
			search: (prev) => ({ ...prev, ...(patch as Partial<WatchlistFilters>) }),
			replace: true,
		});
	}

	if (items.length === 0 && !hasActiveFilters(filters)) {
		return (
			<Container>
				<BrandedTitle>My Watchlist</BrandedTitle>
				<p className="text-muted-foreground">
					Your watchlist is empty. Save movies and shows from Discover or Search
					to keep track of them here.
				</p>
				<GuestSyncCallout />
			</Container>
		);
	}

	return (
		<Container>
			<div className="flex flex-col gap-4">
				<BrandedTitle>My Watchlist</BrandedTitle>
				<GuestSyncCallout />
				<MediaFilterBar
					values={filters}
					sortOptions={WATCHLIST_SORTS}
					showStatus
					onChange={updateFilters}
					onClear={() => navigate({ search: {}, replace: true })}
				/>
			</div>
			{items.length === 0 && (
				<p className="text-muted-foreground">
					Nothing in your watchlist matches these filters.
				</p>
			)}
			<div className={MEDIA_GRID_CLASS}>
				{items.map(({ media }) => (
					<MediaCard
						key={mediaKey(media)}
						media={media}
						watchlistStatus={statuses[mediaKey(media)] ?? null}
					/>
				))}
			</div>
			<InfiniteScrollFooter
				ref={sentinelRef}
				isFetchingNextPage={isFetchingNextPage}
				isError={isFetchNextPageError}
				onRetry={() => fetchNextPage()}
			/>
		</Container>
	);
}
