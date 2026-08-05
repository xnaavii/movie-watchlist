import type { MovieDetails } from "@lorenzopant/tmdb";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { Genres } from "#/features/movies/components/Genres";
import { MovieLogo } from "#/features/movies/components/MovieLogo";
import { MovieOverview } from "#/features/movies/components/MovieOverview";
import { MovieRow } from "#/features/movies/components/MovieRow";
import { MovieRowSkeleton } from "#/features/movies/components/MovieRowSkeleton";
import { TrailerSection } from "#/features/movies/components/TrailerSection";
import {
	imdbRatingQueryOptions,
	movieQueries,
} from "#/features/movies/queries";
import { normalizeMovie } from "#/features/movies/utils";
import { WatchlistStatusButton } from "#/features/watchlist/components/WatchlistStatusButton";
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

		let movie: MovieDetails;
		try {
			movie = await queryClient.ensureQueryData(
				movieQueries.details({ movie_id: movieId }),
			);
		} catch {
			throw notFound();
		}

		await queryClient.prefetchQuery(
			movieQueries.credits({ movie_id: movieId }),
		);

		queryClient.prefetchQuery(movieQueries.images({ movie_id: movieId }));
		queryClient.prefetchQuery(watchlistQueries.status(movieId));
		queryClient.prefetchQuery(
			movieQueries.recommendations({ movie_id: movieId }),
		);
		if (movie.imdb_id) {
			queryClient.prefetchQuery(imdbRatingQueryOptions(movie.imdb_id));
		}

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
	const {
		data: imdbRating,
		isLoading: isImdbRatingLoading,
		isError: isImdbRatingError,
		error: imdbRatingError,
	} = useQuery({
		...imdbRatingQueryOptions(movie.imdb_id ?? ""),
		enabled: Boolean(movie.imdb_id),
	});

	const {
		data: credits,
		isLoading: isCreditsLoading,
		isError: isCreditsError,
		error: creditsError,
	} = useQuery(movieQueries.credits({ movie_id: movie.id }));

	const {
		data: recommendedMovies,
		isLoading: isRecommendedMoviesLoading,
		isError: isRecommendedMoviesError,
		error: recommendedMoviesError,
	} = useQuery(movieQueries.recommendations({ movie_id: movie.id }));

	const { data: images } = useQuery(
		movieQueries.images({ movie_id: movie.id }),
	);

	const logoSrc = images?.logos[0]
		? `https://image.tmdb.org/t/p/original${images.logos[0].file_path}`
		: undefined;

	const director = credits?.crew.find((m) => m.job === "Director");
	const topCast = credits?.cast.slice(0, 5);

	return (
		<div className="flex flex-col gap-6 relative" key={movie.id}>
			{/* Backdrop image and overlay */}
			<div className="relative w-full h-[clamp(30vh,80vh+10svh,90vh)] flex p-4 md:p-6 lg:p-8 items-end">
				{movie?.backdrop_path ? (
					<>
						<img
							src={movie.backdrop_path}
							alt={`${movie.title} banner`}
							className="absolute right-0 bottom-0 object-cover size-full object-top"
						/>
						<div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />
					</>
				) : movie.poster_path ? (
					<>
						<img
							src={movie.poster_path}
							alt={`${movie.title} poster`}
							className="absolute inset-0 object-contain size-full object-center"
						/>
						<div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />
					</>
				) : (
					<div className="absolute right-0 bottom-0 size-full bg-muted flex flex-col items-center justify-center">
						<ImageOff />
						<p className="text-xl text-muted-foreground">No Image</p>
					</div>
				)}

				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-end z-20 w-full">
					<div className="flex flex-col gap-2 text-sm md:text-base max-w-xl">
						<MovieLogo logoSrc={logoSrc} title={movie.title} />
						<p className="text-muted-foreground">
							{new Date(movie.release_date).getFullYear()}
						</p>
						<Genres genres={movie.genres} />
						{movie.overview && <MovieOverview overview={movie.overview} />}

						{isCreditsLoading ? (
							<span className="bg-muted animate-pulse w-32 h-5 rounded" />
						) : isCreditsError ? (
							<p>There was an error loading credits: {creditsError.message}</p>
						) : (
							<>
								<div className="flex gap-1 items-center">
									<p className="text-muted-foreground">Director</p>
									<p>{director?.name}</p>
								</div>
								<div className="flex gap-1 items-center flex-wrap">
									<p className="text-muted-foreground">Starring</p>
									{topCast?.map((cast, i) => (
										<p key={cast.id}>
											{cast?.name}
											{topCast.length > i + 1 ? "," : null}
										</p>
									))}
								</div>
							</>
						)}

						{isImdbRatingLoading ? (
							<span className="bg-muted animate-pulse w-24 h-5 rounded"></span>
						) : isImdbRatingError ? (
							<p>{imdbRatingError.message}</p>
						) : (
							<div className="flex gap-1 items-center">
								<p className="text-muted-foreground">IMDB</p>
								<p>{imdbRating?.imdbRating ?? "—"}</p>
							</div>
						)}
					</div>
					<WatchlistStatusButton movieId={movie.id} />
				</div>
			</div>

			<div className="flex flex-col gap-20 p-4 md:p-6 lg:p-8">
				<TrailerSection movie={movie} />
				<section className="flex flex-col gap-4">
					<h2 className="text-2xl tracking-tighter">Similar movies</h2>
					{isRecommendedMoviesLoading ? (
						<MovieRowSkeleton />
					) : isRecommendedMoviesError ? (
						<p>{recommendedMoviesError.message}</p>
					) : recommendedMovies ? (
						<MovieRow
							movies={recommendedMovies.results.map((movie) =>
								normalizeMovie(movie),
							)}
						/>
					) : null}
				</section>
			</div>

			{/* TODO: Save streaming sources to the db to ensure api calls are reduced */}
			{/* <StreamingSources tmdbId={movie.imdb_id ?? ""} /> */}
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
