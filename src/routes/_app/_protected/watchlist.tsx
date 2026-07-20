import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { watchlistQueries } from "#/features/watchlist/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";

export const Route = createFileRoute("/_app/_protected/watchlist")({
	component: WatchlistPage,
	pendingComponent: WatchlistPending,
	errorComponent: ({ error }) => (
		<div className="p-2 md:p-4 lg:p-8 mt-10 md:mt-0">
			<p className="text-destructive">
				Failed to load your watchlist: {error.message}
			</p>
		</div>
	),
	loader: async ({ context }) => {
		await context.queryClient.ensureInfiniteQueryData(
			watchlistQueries.infiniteList(),
		);
	},
});

function WatchlistPage() {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(watchlistQueries.infiniteList());

	const items = data.pages.flatMap((page) => page.results);
	const { data: statuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);

	const sentinelRef = useInfiniteScrollTrigger(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, hasNextPage);

	if (items.length === 0) {
		return (
			<div className="p-2 md:p-4 lg:p-8 mt-10 md:mt-0">
				<p className="text-muted-foreground">Your watchlist is empty.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-2 md:p-4 lg:p-8 mt-10 md:mt-0">
			<h1 className="text-2xl md:text-3xl tracking-tighter font-medium">
				My Watchlist
			</h1>
			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
				{items.map(({ movie }) => (
					<MovieCard
						key={movie.id}
						id={movie.tmdbId}
						title={movie.title}
						posterPath={movie.posterPath}
						watchlistStatus={statuses[movie.tmdbId] ?? null}
					/>
				))}
				<div ref={sentinelRef} className="h-10 -mt-10 pointer-events-none" />
			</div>
		</div>
	);
}

function WatchlistPending() {
	const skeletonItems = Array.from({ length: 10 }, (_, i) => ({
		id: i,
	}));
	return (
		<div className="flex flex-col gap-6 p-2 md:p-4 lg:p-8 mt-10 md:mt-0 animate-pulse">
			<div className="h-8 w-48 bg-muted rounded" />
			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
				{skeletonItems.map((item) => (
					<div key={item.id} className="aspect-2/3 bg-muted rounded-lg" />
				))}
			</div>
		</div>
	);
}
