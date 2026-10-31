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
import { mediaKey } from "#/features/media/utils";
import {
	hasActiveFilters,
	WATCHLIST_SORTS,
	type WatchlistFilters,
	watchlistFilterSearchSchema,
} from "#/features/media/utils/filters";
import { GuestSyncCallout } from "#/features/watchlist/guest/GuestSyncCallout";
import { watchlistQueries } from "#/features/watchlist/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { getErrorMessage } from "#/lib/utils";

export const Route = createFileRoute("/_app/watchlist/")({
	component: WatchlistPage,
	validateSearch: watchlistFilterSearchSchema,
	loaderDeps: ({ search }) => search,
	pendingComponent: WatchlistPending,
	errorComponent: ({ error }) => (
		<div className="p-2 md:p-4 lg:p-8 mt-10 md:mt-0">
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
			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
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

function WatchlistPending() {
	const skeletonItems = Array.from({ length: 10 }, (_, i) => ({
		id: i,
	}));
	return (
		<div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 mt-12 md:mt-0 animate-pulse">
			<div className="h-8 w-48 bg-muted rounded" />
			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
				{skeletonItems.map((item) => (
					<div key={item.id} className="aspect-2/3 bg-muted rounded-lg" />
				))}
			</div>
		</div>
	);
}
