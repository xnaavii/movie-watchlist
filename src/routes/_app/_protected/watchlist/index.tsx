import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BrandedTitle } from "#/components/BrandedTitle";
import { Container } from "#/components/Container";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { MovieCard } from "#/features/movies/components/MovieCard";
import {
	MovieFilterBar,
	type MovieFilterValues,
} from "#/features/movies/components/MovieFilterBar";
import {
	hasActiveFilters,
	WATCHLIST_SORTS,
	type WatchlistFilters,
	watchlistFilterSearchSchema,
} from "#/features/movies/utils/filters";
import { watchlistQueries } from "#/features/watchlist/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { getErrorMessage } from "#/lib/utils";

export const Route = createFileRoute("/_app/_protected/watchlist/")({
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

	// Pages are offset based, so a movie can show up twice if the list changes
	// while paging. Keep the first copy of each.
	const items = Array.from(
		new Map(
			data.pages
				.flatMap((page) => page.results)
				.map((item) => [item.movie.id, item]),
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

	function updateFilters(patch: MovieFilterValues) {
		navigate({
			search: (prev) => ({ ...prev, ...(patch as Partial<WatchlistFilters>) }),
			replace: true,
		});
	}

	if (items.length === 0 && !hasActiveFilters(filters)) {
		return (
			<div className="p-2 md:p-4 lg:p-8 mt-10 md:mt-0">
				<p className="text-muted-foreground">Your watchlist is empty.</p>
			</div>
		);
	}

	return (
		<Container>
			<div className="flex flex-col gap-4">
				<BrandedTitle>My Watchlist</BrandedTitle>
				<MovieFilterBar
					values={filters}
					sortOptions={WATCHLIST_SORTS}
					showStatus
					onChange={updateFilters}
					onClear={() => navigate({ search: {}, replace: true })}
				/>
			</div>
			{items.length === 0 && (
				<p className="text-muted-foreground">
					No movies in your watchlist match these filters.
				</p>
			)}
			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
				{items.map(({ movie }) => (
					<MovieCard
						key={movie.id}
						movie={movie}
						watchlistStatus={statuses[movie.id] ?? null}
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
