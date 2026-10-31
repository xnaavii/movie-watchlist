import {
	useQuery,
	useQueryClient,
	useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	notFound,
	redirect,
} from "@tanstack/react-router";
import { Clapperboard, Tv } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";
import { BrandedTitle } from "#/components/BrandedTitle";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { PillNav, PillNavItem } from "#/components/PillNav";
import { Button } from "#/components/ui/button";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import { GenreDiscoverSections } from "#/features/media/components/GenreDiscoverSections";
import { MediaBackdropMarquee } from "#/features/media/components/MediaBackdropMarquee";
import { MediaGrid } from "#/features/media/components/MediaGrid";
import { MediaRow } from "#/features/media/components/MediaRow";
import {
	type DiscoverGenre,
	findDiscoverGenre,
	hasMediaType,
	toWithGenres,
} from "#/features/media/genres";
import { mediaQueries } from "#/features/media/queries";
import type { MediaDiscoverRequest } from "#/features/media/server/media.functions";
import {
	MEDIA_TYPES,
	type MediaItem,
	type MediaType,
} from "#/features/media/types";
import { interleave, mediaKey } from "#/features/media/utils";
import { toTmdbImageUrl } from "#/features/media/utils/tmdb";
import { watchlistQueries } from "#/features/watchlist/queries";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { seo } from "#/utils/seo";

const genreSearchSchema = z.object({
	/** Which type the popular grid at the bottom shows. */
	type: z.enum(MEDIA_TYPES).optional().catch(undefined),
});

/** The popular titles of one type in a genre. */
const popularInGenre = (genre: DiscoverGenre, mediaType: MediaType) =>
	mediaQueries.infiniteDiscover({
		mediaType,
		params: { with_genres: toWithGenres(genre, mediaType) },
	} as MediaDiscoverRequest);

/** The types a genre has titles for, movies first. */
const genreMediaTypes = (genre: DiscoverGenre) =>
	MEDIA_TYPES.filter((mediaType) => hasMediaType(genre, mediaType));

export const Route = createFileRoute("/_app/discover/$genreSlug")({
	params: {
		priority: 10,
		parse: ({ genreSlug }) => {
			if (!/^[a-z0-9-]+$/i.test(genreSlug)) throw notFound();
			return { genreSlug };
		},
	},
	validateSearch: genreSearchSchema,
	beforeLoad: ({ params }) => {
		const genre = findDiscoverGenre(params.genreSlug);
		if (!genre) throw notFound();

		// Send legacy numeric URLs to the readable one.
		if (params.genreSlug !== genre.slug) {
			throw redirect({
				to: "/discover/$genreSlug",
				params: { genreSlug: genre.slug },
				statusCode: 301,
				replace: true,
			});
		}
		return { genre };
	},
	loader: async ({ context }) => {
		const { genre, queryClient } = context;

		const [pages] = await Promise.all([
			Promise.all(
				genreMediaTypes(genre).map((mediaType) =>
					queryClient.infiniteQuery({
						...popularInGenre(genre, mediaType),
						staleTime: "static",
					}),
				),
			),
			queryClient.query({
				...watchlistQueries.mediaByGenre(genre.slug),
				staleTime: "static",
			}),
			queryClient.query({
				...watchlistQueries.watchlistStatuses(),
				staleTime: "static",
			}),
		]);

		return {
			poster: pages[0]?.pages[0]?.results[0]?.posterPath,
		};
	},
	head: ({ loaderData, params }) => {
		const genre = findDiscoverGenre(params.genreSlug);
		if (!genre) return {};
		return {
			meta: seo({
				title: `${genre.name} Movies and TV Shows | ${SITE_CONFIG.name}`,
				description: genreTagline(genre),
				image: toTmdbImageUrl(loaderData?.poster, "w500"),
				url: `${getSiteUrl()}/discover/${genre.slug}`,
			}),
		};
	},
	component: DiscoverGenrePage,
	notFoundComponent: DiscoverGenrePageNotFound,
});

function genreTagline(genre: DiscoverGenre) {
	const types = genreMediaTypes(genre);
	const what =
		types.length === 2
			? "movies and shows"
			: types[0] === "tv"
				? "shows"
				: "films";
	return `Handpicked ${genre.name} ${what} to add to your list`;
}

function DiscoverGenrePage() {
	const { genre } = Route.useRouteContext();
	const search = Route.useSearch();
	const mediaTypes = genreMediaTypes(genre);
	const gridType =
		search.type && mediaTypes.includes(search.type)
			? search.type
			: mediaTypes[0];

	// Guests read these from their device, so they run signed out too.
	const { data: watchlistStatuses } = useQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const { data: watchlistItems } = useQuery(
		watchlistQueries.mediaByGenre(genre.slug),
	);

	return (
		<>
			<GenreHero genre={genre} mediaTypes={mediaTypes} />

			{watchlistItems && watchlistItems.length > 0 && (
				<section>
					<MediaRow
						header={
							<div className="flex items-end justify-between gap-4">
								<h2 className="text-xl lg:text-2xl tracking-tighter">
									{genre.name} in Your Watchlist
								</h2>
								<Button variant="link" asChild className="shrink-0 px-0">
									<Link to="/watchlist">See all</Link>
								</Button>
							</div>
						}
						items={watchlistItems}
						watchlistStatuses={watchlistStatuses}
					/>
				</section>
			)}

			<GenreDiscoverSections
				genre={genre}
				watchlistStatuses={watchlistStatuses}
			/>

			<PopularInGenre
				genre={genre}
				mediaType={gridType}
				mediaTypes={mediaTypes}
				watchlistStatuses={watchlistStatuses}
			/>
		</>
	);
}

interface GenreHeroProps {
	genre: DiscoverGenre;
	mediaTypes: MediaType[];
}

function GenreHero({ genre, mediaTypes }: GenreHeroProps) {
	const queryClient = useQueryClient();
	// The loader fetched the first page of each type for the grid below.
	const backdrops = useMemo(() => {
		const [first = [], second = []] = mediaTypes.map(
			(mediaType) =>
				queryClient.getQueryData(popularInGenre(genre, mediaType).queryKey)
					?.pages[0]?.results ?? [],
		);
		return interleave(first, second);
	}, [queryClient, genre, mediaTypes]);

	return (
		<div className="relative isolate flex items-center justify-center">
			<div className="absolute flex flex-col items-center gap-3 z-20 px-4 text-center">
				<div className="flex gap-1.5">
					{mediaTypes.map((mediaType) => (
						<span
							key={mediaType}
							className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground [&_svg]:size-3.5"
						>
							{mediaType === "movie" ? (
								<Clapperboard aria-hidden="true" />
							) : (
								<Tv aria-hidden="true" />
							)}
							{mediaType === "movie" ? "Movies" : "TV shows"}
						</span>
					))}
				</div>
				<BrandedTitle>{genre.name}</BrandedTitle>
				<p className="text-sm lg:text-base text-muted-foreground">
					{genreTagline(genre)}
				</p>
			</div>
			<div className="pointer-events-none absolute inset-0 size-full bg-background/60 z-10"></div>
			<MediaBackdropMarquee items={backdrops} />
		</div>
	);
}

interface PopularInGenreProps {
	genre: DiscoverGenre;
	mediaType: MediaType;
	mediaTypes: MediaType[];
	watchlistStatuses?: Record<string, WatchlistStatus>;
}

/** An endless grid of the genre's popular titles, one type at a time. */
function PopularInGenre({
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
	} = useSuspenseInfiniteQuery(popularInGenre(genre, mediaType));

	// TMDB pages can overlap as rankings shift, so drop repeats.
	const items = useMemo(() => {
		const byKey = new Map<string, MediaItem>();
		for (const page of data.pages) {
			for (const item of page.results) {
				if (!byKey.has(mediaKey(item))) byKey.set(mediaKey(item), item);
			}
		}
		return [...byKey.values()];
	}, [data]);

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
									{type === "movie" ? "Movies" : "TV shows"}
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

function DiscoverGenrePageNotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-6 flex-1 h-full">
			<div className="flex flex-col items-center gap-2">
				<BrandedTitle>Oops</BrandedTitle>
				<p className="text-sm lg:text-base text-muted-foreground">
					This genre doesn't exist
				</p>
			</div>
			<Button asChild variant="contrast">
				<Link to="/discover">Back to Discover</Link>
			</Button>
		</div>
	);
}
