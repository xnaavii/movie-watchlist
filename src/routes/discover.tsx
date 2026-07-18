import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { GenreList } from "#/features/movies/components/GenreList";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { MoviesCarousel } from "#/features/movies/components/MoviesCarousel";
import { MoviesSection } from "#/features/movies/components/MoviesSection";
import { movieQueries } from "#/features/movies/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";

export const Route = createFileRoute("/discover")({
	component: DiscoverPage,
	pendingComponent: () => <p>Loading...</p>,
	errorComponent: ({ error }) => <p>{error.message}</p>,
	validateSearch: (search) => ({
		genreId: search.genreId ? Number(search.genreId) : undefined,
	}),
	loaderDeps: ({ search }) => ({ genreId: search.genreId }),
	loader: async ({ context, deps }) => {
		return await Promise.all([
			context.queryClient.ensureQueryData(movieQueries.genres({})),
			context.queryClient.ensureInfiniteQueryData(
				movieQueries.discover({ with_genres: deps.genreId }),
			),
		]);
	},
});

function DiscoverPage() {
	const { genreId } = Route.useSearch();
	const { data: genres } = useSuspenseQuery(movieQueries.genres({}));
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(movieQueries.discover({ with_genres: genreId }));

	const movies = Array.from(
		new Map(
			data.pages
				.flatMap((page) => page.results)
				.map((movie) => [movie.id, movie]),
		).values(),
	);

	const sentinelRef = useInfiniteScrollTrigger(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, hasNextPage);

	// TODO: Display movies list and allow user to select which list they want to see;

	return (
		<div className="flex flex-col gap-10 p-2 md:p-6 mt-16 md:mt-0">
			<MoviesCarousel movies={movies} />
			<GenreList genres={genres.genres} />

			{genreId ? (
				<div className="flex flex-col gap-6">
					<h2 className="text-xl md:text-3xl tracking-tighter font-medium">
						Displaying{" "}
						{genres.genres.find((genre) => genre.id === genreId)?.name} Movies
					</h2>
					<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2.5">
						{movies.map((movie) => (
							<MovieCard
								key={movie.id}
								id={movie.id}
								title={movie.title}
								posterPath={movie.poster_path ?? null}
							/>
						))}
						<div
							ref={sentinelRef}
							className="h-10 -mt-10 pointer-events-none"
						/>
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-20">
					<MoviesSection title="Popular" list="popular" />
					<MoviesSection title="In Theaters" list="now_playing" />
					<MoviesSection title="Upcoming" list="upcoming" />
					<MoviesSection title="Top Rated" list="top_rated" />
				</div>
			)}
		</div>
	);
}
