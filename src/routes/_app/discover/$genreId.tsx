import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "#/components/BackButton";
import { FeaturedMoviesCarousel } from "#/features/movies/components/FeaturedMoviesCarousel";
import { movieQueries } from "#/features/movies/queries";

export const Route = createFileRoute("/_app/discover/$genreId")({
	params: {
		priority: 10,
		parse: ({ genreId }) => {
			if (!/^\d+$/.test(genreId)) return false;
			return { genreId: Number(genreId) };
		},
	},
	loader: async ({ context, params }) => {
		const [genres, movies] = await Promise.all([
			context.queryClient.ensureQueryData(movieQueries.genres({})),
			context.queryClient.ensureQueryData(
				movieQueries.discover({ with_genres: params.genreId }),
			),
		]);

		return { genres, movies };
	},
	component: DiscoverGenrePage,
});

function DiscoverGenrePage() {
	const { genreId } = Route.useParams();
	const { data: genres } = useSuspenseQuery(movieQueries.genres({}));
	const { data: movies } = useSuspenseQuery(
		movieQueries.discover({ with_genres: genreId }),
	);
	const selectedGenre = genres.genres.find((genre) => genre.id === genreId);

	return (
		<>
			<div className="flex items-center w-full justify-between">
				<BackButton />

				<h1 className="relative text-2xl lg:text-3xl tracking-tight font-medium">
					{selectedGenre?.name}
					<div className="absolute bottom-0 translate-y-1/5 right-0 w-full scale-x-110 scale-y-120 h-3 -rotate-4 skew-3 bg-primary -z-10"></div>
				</h1>
			</div>
			<FeaturedMoviesCarousel movies={movies.results} genres={genres.genres} />
		</>
	);
}
