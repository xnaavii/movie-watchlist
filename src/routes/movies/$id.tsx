import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ListPlus } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { Genres } from "#/features/movies/components/Genres";
import { Poster } from "#/features/movies/components/Poster";
import { TrailerSection } from "#/features/movies/components/TrailerSection";
import {
	imdbRatingQueryOptions,
	movieQueries,
} from "#/features/movies/queries";

export const Route = createFileRoute("/movies/$id")({
	component: MovieDetailsPage,
	loader: ({ params, context }) =>
		context.queryClient.ensureQueryData(
			movieQueries.details({ movie_id: Number(params.id) }),
		),
	head: ({ loaderData, params }) => {
		if (!loaderData) {
			return { meta: [{ title: "Movie not found" }] };
		}
		const movie = loaderData;
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
});

function MovieDetailsPage() {
	const { id } = Route.useParams();
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

	const router = useRouter();

	return (
		<div className="flex flex-col gap-8">
			<div className="relative w-full h-[80vh]">
				<Button
					className="absolute top-6 left-6 z-20"
					variant="secondary"
					onClick={() => router.history.back()}
				>
					<ChevronLeft />
					Return
				</Button>

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

				<div className="absolute bottom-0 p-6 z-10">
					{/* Movie poster and details */}
					<div className="grid grid-cols-[auto_1fr] gap-8">
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
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2 max-w-4xl">
								<h1 className="font-semibold text-5xl min-w-0">
									{movie.title}
								</h1>
								{/* Release year */}
								<p>{new Date(movie.release_date).getFullYear()}</p>
								<Genres genres={movie.genres} />
								{/* Imdb rating */}
								{isPending ? (
									<span className="bg-muted animate-pulse w-24 h-5 rounded"></span>
								) : isError ? (
									<p>{error.message}</p>
								) : (
									<span className="text-sm text-muted-foreground">
										{imdbRating?.imdbRating ?? "—"}
									</span>
								)}
								<p className="text-lg text-muted-foreground">
									{movie.overview}
								</p>
							</div>
							<Button className="w-fit">
								<ListPlus />
								Add to watchlist
							</Button>
						</div>
					</div>
				</div>
			</div>
			<TrailerSection movie={movie} />
		</div>
	);
}
