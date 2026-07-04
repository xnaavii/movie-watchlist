import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Dot } from "lucide-react";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { MovieBanner } from "#/features/movies/components/MovieBanner";
import { MoviePoster } from "#/features/movies/components/MoviePoster";
import { getMovie } from "#/features/movies/server/movies.functions";
import { formatRuntime } from "#/features/movies/utils/format";
import { getMovieImage } from "#/features/movies/utils/tmdb";

const movieQuery = (id: number) =>
	queryOptions({
		queryKey: ["movie", id],
		queryFn: () => getMovie({ data: { id } }),
	});

export const Route = createFileRoute("/movies/$id")({
	component: MovieDetails,
	loader: ({ params, context }) => {
		return context.queryClient.ensureQueryData(movieQuery(Number(params.id)));
	},
	head: ({ loaderData, params }) => {
		if (!loaderData?.success) {
			return { meta: [{ title: "Movie not found" }] };
		}

		const movie = loaderData.data;
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

function MovieDetails() {
	const { id } = Route.useParams();
	const { data: result } = useSuspenseQuery(movieQuery(Number(id)));
	const router = useRouter();

	if (!result.success) {
		return <div className="p-4 text-red-500">{result.error}</div>;
	}

	const movie = result.data;

	console.log(movie);

	const runtime = formatRuntime(movie.runtime);

	return (
		<div className="overflow-hidden overflow-y-scroll h-full">
			<MovieBanner backdropPath={movie.backdrop_path} title={movie.title}>
				<div className="absolute top-6 left-6 z-9">
					<Button
						variant="ghost"
						className="bg-background/15 backdrop-blur-xl"
						onClick={() => router.history.back()}
					>
						<ChevronLeft />
						Go back
					</Button>
				</div>
				<div className="absolute bottom-6 left-6 z-9 w-full flex gap-4">
					<div className="w-37.5 sm:w-50 shrink-0">
						<MoviePoster posterPath={movie.poster_path} title={movie.title} />
					</div>
					{/* Movie Details */}
					<div className="flex flex-col gap-4 max-w-2xl">
						<h2 className="text-4xl font-semibold">{movie.title}</h2>
						<ul className="flex items-center gap-2 flex-wrap">
							{runtime && (
								<li className="flex items-center gap-2">
									<span>{runtime}</span>
									<Dot />
								</li>
							)}
							{movie.genres.map((genre, index) => (
								<li key={genre.id} className="flex items-center gap-2">
									<span>{genre.name}</span>
									{index + 1 !== movie.genres.length && <Dot />}
								</li>
							))}
						</ul>
					</div>
				</div>
			</MovieBanner>

			{/* Storyline */}
			<div className="flex flex-col gap-2 max-w-2xl p-6">
				<h3 className="text-lg font-medium">Storyline</h3>
				<p className="text-secondary">{movie.overview}</p>
			</div>
		</div>
	);
}
