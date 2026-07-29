import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
			<h1 className="text-2xl lg:text-3xl tracking-tighter">
				Discover {selectedGenre?.name}
			</h1>
			<FeaturedMoviesCarousel movies={movies.results} genres={genres.genres} />
		</>
	);
}
