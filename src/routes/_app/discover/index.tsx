import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioLines } from "lucide-react";
import { BrandedTitle } from "#/components/BrandedTitle";
import { Button } from "#/components/ui/button";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import { DiscoverMediaSection } from "#/features/media/components/DiscoverMediaSection";
import { FeaturedMediaCarousel } from "#/features/media/components/FeaturedMediaCarousel";
import { GenreRow } from "#/features/media/components/GenreRow";
import { MediaRow } from "#/features/media/components/MediaRow";
import { SectionHeader } from "#/features/media/components/SectionHeader";
import { useMediaLogos } from "#/features/media/hooks/useMediaLogos";
import { mediaQueries } from "#/features/media/queries";
import { toTmdbImageUrl } from "#/features/media/utils/tmdb";
import { WatchlistMoviesView } from "#/features/watchlist/components/WatchlistMoviesView";
import { watchlistQueries } from "#/features/watchlist/queries";
import { getErrorMessage } from "#/lib/utils";
import { seo } from "#/utils/seo";

const POPULAR_MOVIES = { mediaType: "movie", list: "popular" } as const;

export const Route = createFileRoute("/_app/discover/")({
	component: DiscoverPage,
	pendingComponent: DiscoverPagePending,
	errorComponent: ({ error }) => <DiscoverPageError error={error} />,
	loader: async ({ context }) => {
		const [genres, , movies] = await Promise.all([
			context.queryClient.query({
				...mediaQueries.genres("movie"),
				staleTime: "static",
			}),
			context.queryClient.query({
				...watchlistQueries.watchlistStatuses(),
				staleTime: "static",
			}),
			context.queryClient.query({
				...mediaQueries.list(POPULAR_MOVIES),
				staleTime: "static",
			}),
			context.queryClient.query({
				...watchlistQueries.list(),
				staleTime: "static",
			}),
		]);
		return { genres, movies };
	},
	head: ({ loaderData }) => {
		const firstMovie = loaderData?.movies.results[0];
		const posterImage = toTmdbImageUrl(firstMovie?.posterPath, "w500");

		return {
			meta: seo({
				title: `Discover Movies and TV Shows | ${SITE_CONFIG.name}`,
				description:
					"Discover trending, new, top rated and hidden gem movies and TV shows, or browse by genre.",
				image: posterImage,
				url: `${getSiteUrl()}/discover`,
			}),
		};
	},
});

function DiscoverPage() {
	const { data: watchlistStatuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const { data: genres } = useSuspenseQuery(mediaQueries.genres("movie"));
	const { data: popularMovies } = useSuspenseQuery(
		mediaQueries.list(POPULAR_MOVIES),
	);

	const popularMoviesLogos = useMediaLogos(popularMovies.results);

	return (
		<>
			<section className="flex flex-col gap-6">
				<BrandedTitle>Your Next Watch</BrandedTitle>
				<FeaturedMediaCarousel
					items={popularMovies.results}
					genres={genres.genres}
					watchlistStatuses={watchlistStatuses}
					logos={popularMoviesLogos}
				/>
			</section>
			<section className="flex flex-col gap-4">
				<h2 className="text-xl lg:text-2xl tracking-tighter">
					Discover by genre
				</h2>
				<GenreRow genres={genres.genres} />
			</section>
			<AtmosShowcaseLink />
			<section className="flex flex-col gap-4">
				<SectionHeader title="Popular Movies" section="popular" />
				<MediaRow
					items={popularMovies.results}
					logos={popularMoviesLogos}
					watchlistStatuses={watchlistStatuses}
					variant="backdrop"
					showRanks
				/>
			</section>
			<DiscoverMediaSection
				section="trending"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="now-in-theaters"
				watchlistStatuses={watchlistStatuses}
			/>
			<WatchlistMoviesView />
			<DiscoverMediaSection
				section="trending-tv-shows"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="on-the-air"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="coming-soon"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="top-rated"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="top-rated-tv-shows"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="hidden-gems"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="popular-tv-shows"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="quick-watches"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMediaSection
				section="timeless-classics"
				watchlistStatuses={watchlistStatuses}
			/>
		</>
	);
}

function AtmosShowcaseLink() {
	return (
		<section className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border p-5 md:p-6">
			<div className="flex items-start gap-4">
				<AudioLines className="size-6 shrink-0 mt-0.5" aria-hidden="true" />
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

function DiscoverPagePending() {
	const skeletonItems = Array.from({ length: 5 }, (_, i) => ({
		id: i,
	}));

	return (
		<div className="flex flex-col gap-6 p-4 md:p-10 mt-10 md:mt-0 animate-pulse">
			<div className="w-full h-[40vh] bg-muted rounded-2xl" />
			<div className="flex gap-2">
				{skeletonItems.map((item) => (
					<div key={item.id} className="h-9 w-24 bg-muted rounded-full" />
				))}
			</div>
			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
				{skeletonItems.map((item) => (
					<div key={item.id} className="aspect-2/3 bg-muted rounded-lg" />
				))}
			</div>
		</div>
	);
}

function DiscoverPageError({ error }: { error: unknown }) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-center px-4">
			<h1 className="text-2xl font-medium tracking-tighter">
				Something went wrong
			</h1>
			<p className="text-muted-foreground">{getErrorMessage(error)}</p>
			<Button asChild>
				<Link to="/discover">Try again</Link>
			</Button>
		</div>
	);
}
