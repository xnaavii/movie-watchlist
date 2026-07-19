import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SITE_CONFIG } from "#/config/site";
import { Genres } from "#/features/movies/components/Genres";
import { MovieLogo } from "#/features/movies/components/MovieLogo";
import { MovieOverview } from "#/features/movies/components/MovieOverview";
import { TrailerSection } from "#/features/movies/components/TrailerSection";
import {
	imdbRatingQueryOptions,
	movieQueries,
} from "#/features/movies/queries";
import { WatchlistStatusButton } from "#/features/watchlist/components/WatchlistStatusButton";
import { watchlistQueries } from "#/features/watchlist/queries";

export const Route = createFileRoute("/movies/$id")({
	loader: async ({ params, context }) =>
		await Promise.all([
			context.queryClient.ensureQueryData(
				movieQueries.details({ movie_id: Number(params.id) }),
			),
			context.queryClient.ensureQueryData(
				watchlistQueries.status(Number(params.id)),
			),
		]),
	head: ({ loaderData, params }) => {
		if (!loaderData) {
			return { meta: [{ title: "Movie not found" }] };
		}
		const movie = loaderData[0];
		const pageUrl = `${SITE_CONFIG.url}/${params.id}`;
		const imageUrl = movie.backdrop_path || undefined;
		return {
			meta: [
				{ title: `${movie.title} | ${SITE_CONFIG.name}` },
				{ name: "description", content: movie.overview },
				{ property: "og:title", content: movie.title },
				{ property: "og:description", content: movie.overview },
				{ property: "og:image", content: imageUrl },
				{ property: "og:type", content: "video.movie" },
				{ property: "og:url", content: pageUrl },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: movie.title },
				{ name: "twitter:description", content: movie.overview },
				{ name: "twitter:image", content: imageUrl },
				{ name: "twitter:url", content: pageUrl },
			],
		};
	},
	component: MovieDetailsPage,
	pendingComponent: () => (
		<div className="flex flex-col gap-20 animate-pulse">
			<div className="w-full h-[60vh] bg-muted" />
		</div>
	),
});

function MovieDetailsPage() {
	const { id } = Route.useParams();

	// Movie details
	const { data: movie } = useSuspenseQuery(
		movieQueries.details({ movie_id: Number(id) }),
	);
	const {
		data: imdbRating,
		isPending,
		isError,
		error,
	} = useQuery({
		...imdbRatingQueryOptions(movie.imdb_id ?? ""),
		enabled: Boolean(movie.id),
	});

	const credits = useSuspenseQuery(
		movieQueries.credits({ movie_id: movie.id }),
	);
	const director = credits.data.crew.find((m) => m.job === "Director");
	const topCast = credits.data.cast.slice(0, 5);

	return (
		<div className="flex flex-col gap-20">
			{/* Backdrop image and overlay */}
			<div className="relative w-full h-[clamp(30vh,80vh+10svh,90vh)] flex p-4 md:p-10 items-end">
				{movie.backdrop_path ? (
					<>
						<img
							src={movie.backdrop_path}
							alt={`${movie.title} banner`}
							className="absolute right-0 bottom-0 object-cover size-full object-top"
						/>
						<div className="absolute inset-0 bg-linear-to-b from-transparent via-background/60 to-background" />
					</>
				) : (
					<div className="absolute right-0 bottom-0 size-full bg-muted-foreground flex flex-col items-center justify-center">
						<p className="text-3xl">No Backdrop Image</p>
					</div>
				)}

				<div className="flex flex-col md:flex-row gap-4 justify-between md:items-end z-20 w-full">
					<div className="flex flex-col gap-2 text-sm md:text-base max-w-xl">
						<MovieLogo tmdbId={movie.id} title={movie.title} />
						<p className="text-muted-foreground">
							{new Date(movie.release_date).getFullYear()}
						</p>
						<Genres genres={movie.genres} />
						{movie.overview && <MovieOverview overview={movie.overview} />}
						{director && (
							<div className="flex gap-1 items-center">
								<p className="text-muted-foreground">Director</p>
								<p>{director?.name}</p>
							</div>
						)}
						{topCast && (
							<div className="flex gap-1 items-center flex-wrap">
								<p className="text-muted-foreground">Starring</p>
								{topCast.map((cast, i) => (
									<p key={cast.id}>
										{cast?.name}
										{topCast.length > i + 1 ? "," : null}
									</p>
								))}
							</div>
						)}
						{isPending ? (
							<span className="bg-muted animate-pulse w-24 h-5 rounded"></span>
						) : isError ? (
							<p>{error.message}</p>
						) : (
							<div className="flex gap-1 items-center">
								<p className="text-muted-foreground">IMDB</p>
								<p>{imdbRating?.imdbRating ?? "—"}</p>
							</div>
						)}
					</div>
					<WatchlistStatusButton tmdbId={movie.id} />
				</div>
			</div>

			<TrailerSection movie={movie} />

			{/* TODO: Save streaming sources to the db to ensure api calls are reduced */}
			{/* <StreamingSources tmdbId={movie.imdb_id ?? ""} /> */}
		</div>
	);
}
