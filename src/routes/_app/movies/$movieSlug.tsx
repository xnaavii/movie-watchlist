import type { MovieDetails as MovieDetailsData } from "@lorenzopant/tmdb";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	notFound,
	redirect,
} from "@tanstack/react-router";
import { Suspense } from "react";
import { BackButtonView } from "#/components/BackButtonView";
import { Container } from "#/components/Container";
import { Button } from "#/components/ui/button";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import { JustWatchButton } from "#/features/movies/components/JustWatchButton";
import { MovieBackdropImageView } from "#/features/movies/components/MovieBackdropImageView";
import { MovieCastView } from "#/features/movies/components/MovieCastView";
import { MovieDetailsView } from "#/features/movies/components/MovieDetailsView";
import { MovieFacts } from "#/features/movies/components/MovieFacts";
import { MovieGalleryView } from "#/features/movies/components/MovieGalleryView";
import { MovieLogoView } from "#/features/movies/components/MovieLogoView";
import { MovieReviewsView } from "#/features/movies/components/MovieReviewsView";
import { MovieRowSkeleton } from "#/features/movies/components/MovieRowSkeleton";
import { MovieTrailerView } from "#/features/movies/components/MovieTrailerView";
import { MovieWhereToWatchView } from "#/features/movies/components/MovieWhereToWatchView";
import { RecommendedMoviesView } from "#/features/movies/components/RecommendedMoviesView";
import {
	imdbRatingQueryOptions,
	movieQueries,
} from "#/features/movies/queries";
import { buildMovieHead } from "#/features/movies/utils/meta";
import { parseMovieSlug, toMovieSlug } from "#/features/movies/utils/slug";
import { SoundPanel } from "#/features/sound/components/SoundPanel";
import { TitleAtmosBadge } from "#/features/sound/components/TitleAtmosBadge";
import { WatchlistStatusButtonView } from "#/features/watchlist/components/WatchlistStatusButton";
import { watchlistQueries } from "#/features/watchlist/queries";

export const Route = createFileRoute("/_app/movies/$movieSlug")({
	params: {
		priority: 10,
		parse: ({ movieSlug }) => {
			if (parseMovieSlug(movieSlug) === null) throw notFound();
			return { movieSlug };
		},
	},
	loader: async ({ params, context: { queryClient } }) => {
		const movieId = Number(parseMovieSlug(params.movieSlug));

		let movie: MovieDetailsData;
		try {
			movie = await queryClient.query({
				...movieQueries.details({ movie_id: movieId }),
				staleTime: "static",
			});
		} catch {
			throw notFound();
		}

		// Send id-only or outdated slugs to the canonical readable URL.
		const canonicalSlug = toMovieSlug(movie);
		if (params.movieSlug !== canonicalSlug) {
			throw redirect({
				to: "/movies/$movieSlug",
				params: { movieSlug: canonicalSlug },
				statusCode: 301,
				replace: true,
			});
		}

		await Promise.allSettled([
			queryClient.query({
				...movieQueries.credits({ movie_id: movieId }),
				staleTime: "static",
			}),
			queryClient.query({
				...movieQueries.images({ movie_id: movieId }),
				staleTime: "static",
			}),
			queryClient.query({
				...movieQueries.recommendations({ movie_id: movieId }),
				staleTime: "static",
			}),
			queryClient.query({
				...movieQueries.reviews({ movie_id: movieId }),
				staleTime: "static",
			}),
			queryClient.query({
				...movieQueries.watchProviders({ movie_id: movieId }),
				staleTime: "static",
			}),
			...(movie.imdb_id
				? [
						queryClient.query({
							...imdbRatingQueryOptions(movie.imdb_id),
							staleTime: "static",
						}),
					]
				: []),
			queryClient.query({
				...watchlistQueries.status(movieId),
				staleTime: "static",
			}),
		]);

		return { movie };
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return { meta: [{ title: `Movie not found | ${SITE_CONFIG.name}` }] };
		}
		const movie = loaderData.movie;
		return buildMovieHead(
			movie,
			`${getSiteUrl()}/movies/${toMovieSlug(movie)}`,
		);
	},
	component: MovieDetailsPage,
	pendingComponent: MovieDetailsPagePending,
	notFoundComponent: MovieDetailsPageNotFound,
});

function MovieDetailsPage() {
	const { movieSlug } = Route.useParams();
	const id = Number(parseMovieSlug(movieSlug));

	const { data: movie } = useSuspenseQuery(
		movieQueries.details({ movie_id: id }),
	);

	return (
		<div className="flex flex-col gap-6 relative" key={movie.id}>
			<div className="relative">
				<MovieBackdropImageView movieId={movie.id} title={movie.title} />
				<BackButtonView
					fallbackTo="/discover"
					className="absolute top-16 left-4 md:top-6 md:left-6 lg:top-8 lg:left-8 z-30"
				/>
				<div className="relative -mt-12 md:mt-0 md:absolute md:inset-0 flex flex-col md:justify-end px-4 md:p-6 lg:p-8 z-20">
					<div className="flex flex-col items-center md:items-start gap-8 text-center md:text-left">
						<MovieLogoView movieId={movie.id} title={movie.title} />
						<MovieDetailsView movie={movie} />
						<TitleAtmosBadge tmdbId={movie.id} mediaType="movie" />
						<div className="flex flex-wrap justify-center md:justify-start gap-2">
							<WatchlistStatusButtonView movieId={movie.id} />
							<JustWatchButton title={movie.title} />
						</div>
					</div>
				</div>
			</div>

			<Container className="gap-12 md:gap-16 lg:gap-20 pb-16 md:pb-20 lg:pb-24">
				<MovieWhereToWatchView movieId={movie.id} />
				<SoundPanel tmdbId={movie.id} mediaType="movie" />
				<MovieTrailerView movieId={movie.id} movieTitle={movie.title} />
				<MovieGalleryView movieId={movie.id} movieTitle={movie.title} />
				<MovieCastView movieId={movie.id} />
				<MovieFacts movie={movie} />
				<MovieReviewsView movieId={movie.id} />
				<Suspense fallback={<MovieRowSkeleton />}>
					<RecommendedMoviesView movieId={movie.id} />
				</Suspense>
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
