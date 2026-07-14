import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { Genres } from "#/features/movies/components/Genres";
import { Poster } from "#/features/movies/components/Poster";
import { StreamingSources } from "#/features/movies/components/StreamingSources";
import { TrailerSection } from "#/features/movies/components/TrailerSection";
import {
	imdbRatingQueryOptions,
	movieQueries,
} from "#/features/movies/queries";
import { WatchlistToggleButton } from "#/features/watchlist/components/WatchlistToggleButton";
import { useToggleWatchlist } from "#/features/watchlist/hooks/useToggleWatchlist";
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

	// Watchlist
	const { isInWatchlist, toggleWatchlist } = useToggleWatchlist({
		tmdbId: movie.id,
	});

	const router = useRouter();

	return (
		<div className="relative flex flex-col gap-8">
			<Button
				className="absolute left-6 z-20 mt-16"
				variant="secondary"
				onClick={() => router.history.back()}
			>
				<ChevronLeft />
				Return
			</Button>
			<div className="relative w-full">
				<div className="relative w-full h-[30vh] md:h-[80vh]">
					{/* Backdrop image and overlay */}
					<div className="absolute inset-0 bg-linear-to-r from-background via-transparent via-100% to-transparent size-full z-10"></div>
					<div className="absolute inset-0 bg-linear-to-t from-background via-background via-20% to-transparent size-full z-10"></div>
					{movie.backdrop_path ? (
						<img
							src={movie.backdrop_path}
							alt={`${movie.title} banner`}
							className="absolute right-0 bottom-0 object-cover size-full object-top"
						/>
					) : (
						<div className="absolute right-0 bottom-0 object-cover size-full bg-muted-foreground flex flex-col items-center justify-center">
							<p className="text-3xl">No Backdrop Image</p>
						</div>
					)}
				</div>

				{/* Poster + Details */}
				<div className="relative z-10 -mt-16 px-6 md:mt-0 md:absolute md:inset-x-0 md:bottom-0 md:p-6">
					<div className="flex flex-col items-center text-center gap-8 md:flex-row md:items-start md:text-left">
						{movie.poster_path ? (
							// Movie Poster
							<Poster movie={movie} />
						) : (
							<div className="w-2xs rounded-4xl overflow-hidden bg-muted">
								<AspectRatio ratio={2 / 3}>
									<p className="text-3xl">No Backdrop Image</p>
								</AspectRatio>
							</div>
						)}
						<div className="flex flex-col gap-4 items-center text-center md:items-start md:text-left">
							<div className="flex flex-col gap-4 max-w-4xl items-center text-center md:items-start md:text-left">
								{/* Release year */}
								<h1 className="font-semibold text-4xl md:text-5xl min-w-0">
									{movie.title}
								</h1>
								<p className="text-lg">
									{new Date(movie.release_date).getFullYear()}
								</p>
								<div className="flex flex-col gap-3 items-center md:items-start">
									<div className="flex flex-col gap-1 items-center md:flex-row md:gap-2 md:items-baseline">
										<p className="text-muted-foreground">Director:</p>
										<span>{director?.name}</span>
									</div>
									<div className="flex flex-col gap-1 items-center md:flex-row md:gap-2 md:items-baseline">
										<p className="text-muted-foreground">Cast:</p>
										<div className="flex flex-wrap gap-x-1 justify-center md:justify-start">
											{topCast.map((cast, i) => (
												<span key={cast.id} className="whitespace-nowrap">
													{cast.name}
													{topCast.length > i + 1 ? "," : null}
												</span>
											))}
										</div>
									</div>
								</div>
								<Genres genres={movie.genres} />
								<p className="text text-muted-foreground">{movie.overview}</p>
							</div>
							{/* Imdb rating */}
							{isPending ? (
								<span className="bg-muted animate-pulse w-24 h-5 rounded"></span>
							) : isError ? (
								<p>{error.message}</p>
							) : (
								<p className="text-sm text-muted-foreground">
									IMDB: {imdbRating?.imdbRating ?? "—"}
								</p>
							)}
							<WatchlistToggleButton
								isInWatchlist={isInWatchlist}
								onToggle={() => toggleWatchlist(movie.id)}
							/>
						</div>
					</div>
				</div>
			</div>
			<TrailerSection movie={movie} />
			<StreamingSources tmdbId={movie.imdb_id ?? ""} />
		</div>
	);
}
