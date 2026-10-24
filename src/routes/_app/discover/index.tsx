import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioLines } from "lucide-react";
import { BrandedTitle } from "#/components/BrandedTitle";
import { Button } from "#/components/ui/button";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import { DiscoverMovieSection } from "#/features/movies/components/DiscoverMovieSection";
import { FeaturedMoviesCarousel } from "#/features/movies/components/FeaturedMoviesCarousel";
import { GenreRow } from "#/features/movies/components/GenreRow";
import { MovieRow } from "#/features/movies/components/MovieRow";
import { SectionHeader } from "#/features/movies/components/SectionHeader";
import { useMovieLogos } from "#/features/movies/hooks/useMovieLogos";
import { movieQueries } from "#/features/movies/queries";
import { normalizeMovie } from "#/features/movies/utils";
import { WatchlistMoviesView } from "#/features/watchlist/components/WatchlistMoviesView";
import { watchlistQueries } from "#/features/watchlist/queries";
import { getErrorMessage } from "#/lib/utils";
import { seo } from "#/utils/seo";

export const Route = createFileRoute("/_app/discover/")({
	component: DiscoverPage,
	pendingComponent: DiscoverPagePending,
	errorComponent: ({ error }) => <DiscoverPageError error={error} />,
	loader: async ({ context }) => {
		const [genres, , movies] = await Promise.all([
			context.queryClient.query({
				...movieQueries.genres({}),
				staleTime: "static",
			}),
			context.queryClient.query({
				...watchlistQueries.watchlistStatuses(),
				staleTime: "static",
			}),
			context.queryClient.query({
				...movieQueries.list("popular"),
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
		const posterImage = firstMovie?.poster_path
			? `https://image.tmdb.org/t/p/w500${firstMovie.poster_path}`
			: undefined;

		return {
			meta: seo({
				title: `Discover Movies | ${SITE_CONFIG.name}`,
				description:
					"Discover trending, new, top rated and hidden gem movies, or browse by genre.",
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
	const { data: genres } = useSuspenseQuery(movieQueries.genres({}));
	const { data: popularMovies } = useSuspenseQuery(
		movieQueries.list("popular"),
	);

	const popularMoviesLogos = useMovieLogos(popularMovies.results);

	return (
		<>
			<section className="flex flex-col gap-6">
				<BrandedTitle>Your Next Watch</BrandedTitle>
				<FeaturedMoviesCarousel
					movies={popularMovies.results}
					genres={genres.genres}
					watchlistStatuses={watchlistStatuses}
					movieLogos={popularMoviesLogos}
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
				<MovieRow
					movies={popularMovies.results.map((movie) => normalizeMovie(movie))}
					movieLogos={popularMoviesLogos}
					watchlistStatuses={watchlistStatuses}
					variant="backdrop"
					showRanks
				/>
			</section>
			<DiscoverMovieSection
				section="trending"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				section="now-in-theaters"
				watchlistStatuses={watchlistStatuses}
			/>
			<WatchlistMoviesView />
			<DiscoverMovieSection
				section="coming-soon"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				section="top-rated"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				section="hidden-gems"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				section="quick-watches"
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
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
