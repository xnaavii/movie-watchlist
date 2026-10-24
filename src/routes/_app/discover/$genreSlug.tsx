import {
	useQuery,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	notFound,
	redirect,
} from "@tanstack/react-router";
import { useMemo } from "react";
import { BackButtonView } from "#/components/BackButtonView";
import { BrandedTitle } from "#/components/BrandedTitle";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { Button } from "#/components/ui/button";
import { GenreDiscoverSections } from "#/features/media/components/GenreDiscoverSections";
import { MediaBackdropMarquee } from "#/features/media/components/MediaBackdropMarquee";
import { MediaGrid } from "#/features/media/components/MediaGrid";
import { MediaRow } from "#/features/media/components/MediaRow";
import { mediaQueries } from "#/features/media/queries";
import type { MediaItem } from "#/features/media/types";
import { findGenreBySlug, toGenreSlug } from "#/features/media/utils/slug";
import { watchlistQueries } from "#/features/watchlist/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { getSession } from "#/lib/auth.functions";

export const Route = createFileRoute("/_app/discover/$genreSlug")({
	params: {
		priority: 10,
		parse: ({ genreSlug }) => {
			if (!/^[a-z0-9-]+$/i.test(genreSlug)) throw notFound();
			return { genreSlug };
		},
	},
	loader: async ({ context, params }) => {
		const session = await getSession();

		const genres = await context.queryClient.query({
			...mediaQueries.genres("movie"),
			staleTime: "static",
		});

		const genre = findGenreBySlug(genres.genres, params.genreSlug);
		if (!genre) {
			throw notFound();
		}

		// Send legacy numeric URLs to the readable one.
		const canonicalSlug = toGenreSlug(genre);
		if (params.genreSlug !== canonicalSlug) {
			throw redirect({
				to: "/discover/$genreSlug",
				params: { genreSlug: canonicalSlug },
				statusCode: 301,
				replace: true,
			});
		}
		const genreId = genre.id;

		const [movies, watchlistMovies, watchlistStatuses] = await Promise.all([
			context.queryClient.infiniteQuery({
				...mediaQueries.infiniteDiscover({
					mediaType: "movie",
					params: { with_genres: genreId },
				}),
				staleTime: "static",
			}),
			session
				? context.queryClient.query({
						...watchlistQueries.mediaByGenreId(genreId),
						staleTime: "static",
					})
				: null,
			session
				? context.queryClient.query({
						...watchlistQueries.watchlistStatuses(),
						staleTime: "static",
					})
				: null,
		]);

		return {
			genres,
			movies,
			watchlistMovies,
			watchlistStatuses,
			isAuthenticated: !!session,
		};
	},
	component: DiscoverGenrePage,
	notFoundComponent: DiscoverGenrePageNotFound,
});

function DiscoverGenrePage() {
	const { isAuthenticated } = Route.useLoaderData();
	const { genreSlug } = Route.useParams();

	const { data: genres } = useSuspenseQuery(mediaQueries.genres("movie"));
	const selectedGenre = findGenreBySlug(genres.genres, genreSlug);
	const genreId = selectedGenre?.id ?? 0;

	const { data: watchlistStatuses } = useQuery({
		...watchlistQueries.watchlistStatuses(),
		enabled: isAuthenticated,
	});
	const { data: watchlistMovies } = useQuery({
		...watchlistQueries.mediaByGenreId(genreId),
		enabled: isAuthenticated,
	});

	const {
		data: moviesPages,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
	} = useSuspenseInfiniteQuery(
		mediaQueries.infiniteDiscover({
			mediaType: "movie",
			params: { with_genres: genreId },
		}),
	);

	const movies = useMemo(() => {
		const map = new Map<number, MediaItem>();
		for (const page of moviesPages.pages) {
			for (const movie of page.results) {
				map.set(movie.id, movie);
			}
		}
		return [...map.values()];
	}, [moviesPages]);

	const sentinelRef = useInfiniteScrollTrigger({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		itemCount: movies.length,
		disabled: isFetchNextPageError,
	});

	return (
		<>
			<div className="relative isolate flex items-center justify-center">
				<BackButtonView fallbackTo="/discover" className="self-start z-20" />
				<div className="absolute flex flex-col items-center gap-2 z-20">
					<BrandedTitle>{selectedGenre?.name}</BrandedTitle>
					<p className="text-sm lg:text-base text-muted-foreground">
						Handpicked {selectedGenre?.name} films to add to your list
					</p>
				</div>
				<div className="pointer-events-none absolute inset-0 size-full bg-background/60 z-10"></div>
				<MediaBackdropMarquee items={moviesPages.pages[0].results} />
			</div>

			{isAuthenticated && (
				<section className="flex flex-col gap-4">
					<div className="flex justify-between">
						<h2 className="text-xl lg:text-2xl tracking-tighter">
							{selectedGenre?.name} Movies in Your Watchlist
						</h2>
						<Button variant="link" asChild>
							<Link to="/watchlist">See all</Link>
						</Button>
					</div>

					{watchlistMovies && watchlistStatuses ? (
						<MediaRow
							items={watchlistMovies}
							watchlistStatuses={watchlistStatuses}
						/>
					) : null}
				</section>
			)}

			{selectedGenre && (
				<GenreDiscoverSections
					genre={selectedGenre}
					watchlistStatuses={watchlistStatuses}
				/>
			)}

			<section className="flex flex-col gap-4">
				<h2 className="text-xl lg:text-2xl tracking-tighter">
					{selectedGenre?.name} Popular
				</h2>
				<MediaGrid items={movies} watchlistStatuses={watchlistStatuses} />
				<InfiniteScrollFooter
					ref={sentinelRef}
					isFetchingNextPage={isFetchingNextPage}
					isError={isFetchNextPageError}
					onRetry={() => fetchNextPage()}
				/>
			</section>
		</>
	);
}

function DiscoverGenrePageNotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-6 flex-1 h-full">
			<div className="flex flex-col items-center gap-2">
				<h1 className="relative isolate text-2xl lg:text-4xl tracking-tight font-medium">
					Oops
					<div className="absolute bottom-0 translate-y-1/5 right-0 w-full scale-x-110 scale-y-120 h-3 -rotate-4 skew-3 bg-primary -z-10"></div>
				</h1>
				<p className="text-sm lg:text-base text-muted-foreground">
					This genre doesn't exist
				</p>
			</div>
			<Button asChild>
				<Link to="/discover">Go home</Link>
			</Button>
		</div>
	);
}
