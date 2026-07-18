import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "#/components/ui/button";
import { FeaturedMovies } from "#/features/movies/components/FeaturedMovies";
import { GenreList } from "#/features/movies/components/GenreList";
import { MovieCard } from "#/features/movies/components/MovieCard";
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

	return (
		<div className="relative flex flex-col gap-6">
			<FeaturedMovies movies={movies} />
			<div className="p-6 sticky top-6 flex gap-2.5 items-center w-full md:top-0 md:bg-linear-to-b from-background to-transparent via-background via-50% z-20 overflow-hidden">
				{genreId && (
					<Button disabled={!genreId} size="icon" variant="secondary" asChild>
						<Link to="/discover" search={{ genreId: undefined }}>
							<X />
						</Link>
					</Button>
				)}
				<GenreList genres={genres.genres} />
			</div>
			{genreId ? (
				<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2.5 p-6">
					{movies.map((movie) => (
						<MovieCard
							key={movie.id}
							id={movie.id}
							title={movie.title}
							posterPath={movie.poster_path ?? null}
						/>
					))}
					<div ref={sentinelRef} className="h-10 -mt-10 pointer-events-none" />
					{isFetchingNextPage && <p>Loading more...</p>}
				</div>
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
