import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "#/components/BackButton";
import { MovieBackdropMarquee } from "#/features/movies/components/MovieBackdropMarquee";
import { movieQueries } from "#/features/movies/queries";
import { normalizeMovie } from "#/features/movies/utils";
import { watchlistQueries } from "#/features/watchlist/queries";

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
			context.queryClient.ensureQueryData(watchlistQueries.watchlistStatuses()),
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
			<div className="flex items-center w-full just gap-6">
				<BackButton className="self-start" />
				<h1 className="relative text-2xl lg:text-3xl tracking-tight font-medium">
					{selectedGenre?.name}
					<div className="absolute bottom-0 translate-y-1/5 right-0 w-full scale-x-110 scale-y-120 h-3 -rotate-4 skew-3 bg-primary -z-10"></div>
				</h1>
			</div>
			<MovieBackdropMarquee
				movies={movies.results.map((movie) => normalizeMovie(movie))}
			/>
		</>
	);
}
