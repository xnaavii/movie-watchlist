import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { FeaturedMoviesCarousel } from "#/features/movies/components/FeaturedMoviesCarousel";
import { GenreRow } from "#/features/movies/components/GenreRow";
import { MovieRow } from "#/features/movies/components/MovieRow";
import { movieQueries } from "#/features/movies/queries";
import { watchlistQueries } from "#/features/watchlist/queries";
import { seo } from "#/utils/seo";

export const Route = createFileRoute("/_app/discover/")({
	component: DiscoverPage,
	pendingComponent: DiscoverPagePending,
	errorComponent: ({ error }) => <DiscoverPageError error={error} />,
	loader: async ({ context, deps }) => {
		const [genres, , movies] = await Promise.all([
			context.queryClient.ensureQueryData(movieQueries.genres({})),
			context.queryClient.ensureQueryData(movieQueries.languages()),
			context.queryClient.ensureQueryData(movieQueries.list("popular")),
			context.queryClient.ensureQueryData(watchlistQueries.watchlistStatuses()),
		]);
		return { genres, movies, ...deps };
	},
	head: ({ loaderData }) => {
		const firstMovie = loaderData?.movies.results[0];
		const posterImage = firstMovie?.poster_path
			? `https://image.tmdb.org/t/p/w500${firstMovie.poster_path}`
			: undefined;

		return {
			meta: seo({
				title: `Discover Movies | ${SITE_CONFIG.name}`,
				description: "Discover popular, top rated and movies by genre.",
				image: posterImage,
				url: `${SITE_CONFIG.url}/discover`,
			}),
		};
	},
});

function DiscoverPage() {
	const { data: statuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const { data: genres } = useSuspenseQuery(movieQueries.genres({}));
	const { data: popularMovies } = useSuspenseQuery(
		movieQueries.list("popular"),
	);

	return (
		<>
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl lg:text-4xl tracking-tighter font-medium">
					Your Next Watch
				</h1>
				<FeaturedMoviesCarousel movies={popularMovies.results} />
			</div>
			<section className="flex flex-col gap-4">
				<h2 className="text-xl lg:text-2xl tracking-tighter">
					Discover by genre
				</h2>
				<GenreRow genres={genres.genres} />
			</section>
			<section className="flex flex-col gap-4">
				<h2 className="text-xl lg:text-2xl tracking-tighter">Popular Movies</h2>
				<MovieRow movies={popularMovies.results} watchlistStatuses={statuses} />
			</section>
		</>
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

function DiscoverPageError({ error }: { error: Error }) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-center px-4">
			<h1 className="text-2xl font-medium tracking-tighter">
				Something went wrong
			</h1>
			<p className="text-muted-foreground">{error.message}</p>
			<Button asChild>
				<Link to="/discover">Try again</Link>
			</Button>
		</div>
	);
}
