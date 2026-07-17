import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Item, ItemContent, ItemGroup, ItemTitle } from "#/components/ui/item";
import { FeaturedMovies } from "#/features/movies/components/FeaturedMovies";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { MoviesSection } from "#/features/movies/components/MoviesSection";
import { movieQueries } from "#/features/movies/queries";
import { getMovieGenres } from "#/features/movies/server/movies.functions";

export const Route = createFileRoute("/discover")({
	component: DiscoverPage,
	validateSearch: (search) => ({
		genreId: search.genreId ? Number(search.genreId) : undefined,
	}),
	loader: async ({ context }) => {
		return await Promise.all([
			context.queryClient.ensureQueryData(movieQueries.discover({})),
			getMovieGenres(),
		]);
	},
});

function DiscoverPage() {
	const { data: nowPlayingMovies } = useSuspenseQuery(
		movieQueries.list("now_playing"),
	);
	const { genres } = Route.useLoaderData()[1];
	const { genreId } = Route.useSearch();

	const {
		data: moviesByGenre,
		isLoading,
		isError,
		error,
	} = useQuery({
		...movieQueries.discover({ with_genres: genreId }),
		enabled: Boolean(genreId),
	});

	return (
		<div className="relative flex flex-col gap-6">
			<FeaturedMovies
				movies={moviesByGenre?.results ?? nowPlayingMovies.results}
			/>
			<ItemGroup className="p-6 sticky top-6 md:top-0 md:bg-linear-to-b from-background to-transparent flex flex-row items-center gap-2.5 overflow-x-auto scrollbar-none z-20">
				{genres?.map((genre) => (
					<Item
						key={genre.id}
						variant={genreId === genre.id ? "muted" : "default"}
						asChild
						className="w-fit"
					>
						<Link
							to="/discover"
							search={{ genreId: genre.id }}
							className="shrink-0"
						>
							<ItemContent>
								<ItemTitle>{genre.name}</ItemTitle>
							</ItemContent>
						</Link>
					</Item>
				))}
			</ItemGroup>
			{/* Genres */}
			{genreId ? (
				isLoading ? (
					<p>Loading...</p>
				) : isError ? (
					<p>{error.message}</p>
				) : (
					<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2.5 p-6">
						{moviesByGenre?.results.map((movie) => (
							<MovieCard
								key={movie.id}
								id={movie.id}
								title={movie.title}
								posterPath={movie.poster_path ?? null}
							/>
						))}
					</div>
				)
			) : (
				<div className="flex flex-col gap-20 p-2 md:p-6">
					<MoviesSection title="Popular" list="popular" />
					<MoviesSection title="In Theaters" list="now_playing" />
					<MoviesSection title="Upcoming" list="upcoming" />
					<MoviesSection title="Top Rated" list="top_rated" />
				</div>
			)}
		</div>
	);
}
