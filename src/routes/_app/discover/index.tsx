import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioLines } from "lucide-react";
import { useMemo } from "react";
import { BrandedTitle } from "#/components/BrandedTitle";
import { Button } from "#/components/ui/button";
import { DiscoverDoorways } from "#/features/media/components/DiscoverDoorways";
import { DiscoverMediaSection } from "#/features/media/components/DiscoverMediaSection";
import { DiscoverNav } from "#/features/media/components/DiscoverNav";
import {
	DiscoverPageError,
	DiscoverPagePending,
} from "#/features/media/components/DiscoverPageStates";
import {
	FeaturedMediaCarousel,
	MAX_HERO_SLIDES,
} from "#/features/media/components/FeaturedMediaCarousel";
import { GenreRow } from "#/features/media/components/GenreRow";
import { listDiscoverGenres } from "#/features/media/genres";
import { useMediaLogos } from "#/features/media/hooks/useMediaLogos";
import { mediaQueries } from "#/features/media/queries";
import { sectionQuery } from "#/features/media/sections";
import { interleave } from "#/features/media/utils";
import { WatchlistRowView } from "#/features/watchlist/components/WatchlistRowView";
import { watchlistQueries } from "#/features/watchlist/queries";
import { HOME_TITLE, pageHead, siteJsonLd } from "#/utils/seo";

/** Trending titles of each type in the hero; both rows reuse the same pages. */
const HERO_ITEMS_PER_TYPE = 6;

export const Route = createFileRoute("/_app/discover/")({
	component: DiscoverPage,
	pendingComponent: DiscoverPagePending,
	errorComponent: ({ error }) => <DiscoverPageError error={error} />,
	loader: async ({ context }) => {
		const { queryClient } = context;
		await Promise.all([
			queryClient.ensureInfiniteQueryData(sectionQuery("trending")),
			queryClient.ensureInfiniteQueryData(sectionQuery("trending-tv-shows")),
			queryClient.query({
				...mediaQueries.genres("movie"),
				staleTime: "static",
			}),
			queryClient.query({ ...mediaQueries.genres("tv"), staleTime: "static" }),
			queryClient.query({
				...watchlistQueries.watchlistStatuses(),
				staleTime: "static",
			}),
			queryClient.query({ ...watchlistQueries.list(), staleTime: "static" }),
		]);
	},
	head: () =>
		pageHead({
			title: HOME_TITLE,
			path: "/discover",
			jsonLd: siteJsonLd(),
		}),
});

function DiscoverPage() {
	const { data: watchlistStatuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const { data: movieGenres } = useSuspenseQuery(mediaQueries.genres("movie"));
	const { data: tvGenres } = useSuspenseQuery(mediaQueries.genres("tv"));
	const { data: trendingMovies } = useSuspenseInfiniteQuery(
		sectionQuery("trending"),
	);
	const { data: trendingShows } = useSuspenseInfiniteQuery(
		sectionQuery("trending-tv-shows"),
	);

	const movies = trendingMovies.pages[0]?.results ?? [];
	const shows = trendingShows.pages[0]?.results ?? [];
	const featured = useMemo(
		() =>
			interleave(
				movies.slice(0, HERO_ITEMS_PER_TYPE),
				shows.slice(0, HERO_ITEMS_PER_TYPE),
			).slice(0, MAX_HERO_SLIDES),
		[movies, shows],
	);
	const featuredLogos = useMediaLogos(featured);

	return (
		<>
			<header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div className="flex flex-col gap-2">
					<BrandedTitle>Your Next Watch</BrandedTitle>
					<p className="text-sm lg:text-base text-muted-foreground text-pretty">
						The movies and shows everyone is watching this week.
					</p>
				</div>
				<DiscoverNav />
			</header>
			<FeaturedMediaCarousel
				items={featured}
				genres={[...movieGenres.genres, ...tvGenres.genres]}
				watchlistStatuses={watchlistStatuses}
				logos={featuredLogos}
			/>
			<DiscoverDoorways
				// Skip past the hero's first slides so the tiles show something new.
				movie={movies[HERO_ITEMS_PER_TYPE]}
				tv={shows[HERO_ITEMS_PER_TYPE]}
			/>
			<section>
				<GenreRow
					header={
						<h2 className="text-xl lg:text-2xl tracking-tighter">
							Discover by genre
						</h2>
					}
					genres={listDiscoverGenres()}
				/>
			</section>
			<DiscoverMediaSection
				section="trending"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="trending-tv-shows"
				watchlistStatuses={watchlistStatuses}
			/>
			<WatchlistRowView />
			<DiscoverMediaSection
				section="on-the-air"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="now-in-theaters"
				watchlistStatuses={watchlistStatuses}
			/>
			<AtmosShowcaseLink />
			<DiscoverMediaSection
				section="top-rated"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="top-rated-tv-shows"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="new-series"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="coming-soon"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="hidden-gems"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="hidden-gem-series"
				watchlistStatuses={watchlistStatuses}
			/>
		</>
	);
}

function AtmosShowcaseLink() {
	return (
		<section className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-primary/10 p-5 ring-1 ring-primary/30 md:p-6">
			<div className="flex items-start gap-4">
				<span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<AudioLines className="size-5" aria-hidden="true" />
				</span>
				<div className="flex flex-col gap-1">
					<h2 className="text-xl lg:text-2xl tracking-tighter">
						Dolby Atmos showcase
					</h2>
					<p className="text-sm text-muted-foreground text-pretty">
						Movies and series with great Atmos mixes, ranked by how they sound
						at home. Perfect for testing your speakers.
					</p>
				</div>
			</div>
			<Button asChild variant="contrast" className="w-fit">
				<Link to="/discover/atmos">Explore</Link>
			</Button>
		</section>
	);
}
