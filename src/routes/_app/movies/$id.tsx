import type { MovieDetails as MovieDetailsData } from "@lorenzopant/tmdb";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BackButtonView } from "#/components/BackButtonView";
import { Container } from "#/components/Container";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { JustWatchButton } from "#/features/movies/components/JustWatchButton";
import { MovieBackdropImageView } from "#/features/movies/components/MovieBackdropImageView";
import { MovieDetailsView } from "#/features/movies/components/MovieDetailsView";
import { MovieLogoView } from "#/features/movies/components/MovieLogoView";
import { MovieTrailerView } from "#/features/movies/components/MovieTrailerView";
import { RecommendedMoviesView } from "#/features/movies/components/RecommendedMoviesView";
import {
	imdbRatingQueryOptions,
	movieQueries,
} from "#/features/movies/queries";
import { WatchlistStatusButtonView } from "#/features/watchlist/components/WatchlistStatusButton";
import { watchlistQueries } from "#/features/watchlist/queries";
import { seo, truncateForMeta, truncateTitle } from "#/utils/seo";

export const Route = createFileRoute("/_app/movies/$id")({
	params: {
		priority: 10,
		parse: ({ id }) => {
			if (!/^\d+$/.test(id)) throw notFound();
			return { id: Number(id) };
		},
	},
	loader: async ({ params, context: { queryClient } }) => {
		const movieId = params.id;

		let movie: MovieDetailsData;
		try {
			movie = await queryClient.ensureQueryData(
				movieQueries.details({ movie_id: movieId }),
			);
		} catch {
			throw notFound();
		}

		await Promise.all([
			queryClient.prefetchQuery(movieQueries.credits({ movie_id: movieId })),
			queryClient.prefetchQuery(movieQueries.images({ movie_id: movieId })),
			queryClient.prefetchQuery(
				movieQueries.recommendations({ movie_id: movieId }),
			),
			...(movie.imdb_id
				? [queryClient.prefetchQuery(imdbRatingQueryOptions(movie.imdb_id))]
				: []),
			queryClient.prefetchQuery(watchlistQueries.status(movieId)),
		]);

		return { movie };
	},
	head: ({ loaderData, params }) => {
		if (!loaderData) {
			return { meta: [{ title: "Movie not found" }] };
		}
		const movie = loaderData.movie;
		const pageUrl = `${SITE_CONFIG.url}/${params.id}`;
		const imageUrl = movie.backdrop_path || undefined;
		const pageTitle = `${truncateTitle(movie.title)} | ${SITE_CONFIG.name}`;

		return {
			meta: [
				...seo({
					title: pageTitle,
					description: truncateForMeta(movie.overview),
					image: imageUrl,
				}),
				{ property: "og:type", content: "video.movie" },
				{ property: "og:url", content: pageUrl },
				{ name: "twitter:url", content: pageUrl },
			],
		};
	},
	component: MovieDetailsPage,
	pendingMinMs: 3000,
	pendingComponent: MovieDetailsPagePending,
	notFoundComponent: MovieDetailsPageNotFound,
});

function MovieDetailsPage() {
	const { id } = Route.useParams();

	const { data: movie } = useSuspenseQuery(
		movieQueries.details({ movie_id: id }),
	);

	return (
		<div className="flex flex-col gap-6 relative" key={movie.id}>
			<div className="relative">
				<MovieBackdropImageView movieId={movie.id} title={movie.title} />
				<div className="absolute inset-0 mt-12 md:mt-0 flex flex-col justify-between p-4 md:p-6 lg:p-8 z-20">
					<BackButtonView to="/discover" />
					<div className="flex flex-col gap-8">
						<MovieLogoView movieId={movie.id} title={movie.title} />
						<MovieDetailsView movie={movie} />
						<div className="flex flex-wrap gap-2">
							<WatchlistStatusButtonView movieId={movie.id} />
							<JustWatchButton title={movie.title} />
						</div>
					</div>
				</div>
			</div>

			<Container>
				<MovieTrailerView movieId={movie.id} movieTitle={movie.title} />
				<RecommendedMoviesView movieId={movie.id} />
			</Container>
		</div>
	);
}

function MovieDetailsPagePending() {
	return (
		<div className="flex flex-col gap-20 animate-pulse">
			<div className="w-full h-[clamp(30vh,80vh+10svh,90vh)] bg-muted" />
		</div>
	);
}

function MovieDetailsPageNotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-center px-4">
			<h1 className="text-3xl font-medium tracking-tighter">Movie not found</h1>
			<p className="text-muted-foreground">
				We couldn't find that movie. It may have been removed or the link is
				incorrect.
			</p>
			<Button asChild>
				<Link to="/discover">Back to Discover</Link>
			</Button>
		</div>
	);
}
