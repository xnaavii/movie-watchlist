import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ListPlus } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { movieQueries } from "#/features/movies/queries";
import { formatRuntime } from "#/features/movies/utils/format";
import { getMovieImage } from "#/features/movies/utils/tmdb";

export const Route = createFileRoute("/movies/$id")({
	component: MovieDetailsPage,
	loader: ({ params, context }) =>
		context.queryClient.ensureQueryData(
			movieQueries.details(Number(params.id)),
		),
	head: ({ loaderData, params }) => {
		if (!loaderData) {
			return { meta: [{ title: "Movie not found" }] };
		}
		const movie = loaderData;
		const pageUrl = `${SITE_CONFIG.url}/${params.id}`;
		const imageUrl = getMovieImage(movie.backdrop_path, "w1280") ?? "";
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
	const {
		data: movie,
		error,
		isError,
	} = useSuspenseQuery(movieQueries.details(Number(id)));
	const router = useRouter();

	if (isError) {
		return (
			<div className="p-4 text-destructive-foreground">{error?.message}</div>
		);
	}

	const runtime = formatRuntime(movie.runtime);
	const backdropImage = getMovieImage(movie.backdrop_path, "w1280");
	const posterImage = getMovieImage(movie.poster_path, "w342");

	return (
		<div className="relative w-full h-[80vh]">
			<Button
				className="absolute top-6 left-6 z-10"
				variant="secondary"
				onClick={() => router.history.back()}
			>
				<ChevronLeft />
				Return
			</Button>

			{/* Backdrop image and overlay */}
			<div className="absolute inset-0 bg-linear-to-r from-background via-transparent via-50% to-transparent size-full z-1"></div>
			<div className="absolute inset-0 bg-linear-to-t from-background via-transparent via-100% to-transparent size-full z-1"></div>
			{backdropImage ? (
				<img
					src={backdropImage}
					alt={`${movie.title} banner`}
					className="absolute right-0 bottom-0 object-cover size-full object-top"
				/>
			) : (
				<div className="absolute right-0 bottom-0 object-cover size-full bg-muted-foreground flex flex-col items-center justify-center">
					<p className="text-3xl">No Backdrop Image</p>
				</div>
			)}

			<div className="absolute bottom-0 translate-y-1/3 p-6 z-10">
				{/* Movie poster and details */}
				<div className="grid grid-cols-[auto_1fr] gap-6">
					{posterImage ? (
						<div className="w-xs rounded-4xl overflow-hidden">
							<AspectRatio ratio={2 / 3}>
								<img
									src={posterImage}
									alt={`${movie.title} poster`}
									className="size-full object-cover"
								/>
							</AspectRatio>
						</div>
					) : (
						<div className="w-2xs rounded-4xl overflow-hidden bg-muted">
							<AspectRatio ratio={2 / 3}>
								<p className="text-3xl">No Backdrop Image</p>
							</AspectRatio>
						</div>
					)}
					<div className="flex flex-col gap-6 max-w-5xl">
						<h1 className="font-semibold text-5xl min-w-0">{movie.title}</h1>
						<p className="text-lg text-muted-foreground">{movie.overview}</p>
						<Button className="w-fit">
							<ListPlus />
							Add to watchlist
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
