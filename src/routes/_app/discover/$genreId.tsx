import {
	useQuery,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { BackButton } from "#/components/BackButton";
import { Button } from "#/components/ui/button";
import { MovieBackdropMarquee } from "#/features/movies/components/MovieBackdropMarquee";
import { MovieGrid } from "#/features/movies/components/MovieGrid";
import { MovieRow } from "#/features/movies/components/MovieRow";
import { movieQueries } from "#/features/movies/queries";
import { normalizeMovie } from "#/features/movies/utils";
import { watchlistQueries } from "#/features/watchlist/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { getSession } from "#/lib/auth.functions";

export const Route = createFileRoute("/_app/discover/$genreId")({
	params: {
		priority: 10,
		parse: ({ genreId }) => {
			if (!/^\d+$/.test(genreId)) throw notFound();
			return { genreId: Number(genreId) };
		},
	},
	loader: async ({ context, params }) => {
		const session = await getSession();

		const genres = await context.queryClient.ensureQueryData(
			movieQueries.genres({}),
		);

		const genre = genres.genres.find((genre) => genre.id === params.genreId);
		if (!genre) {
			throw notFound();
		}

		const [movies, watchlistMovies, watchlistStatuses] = await Promise.all([
			context.queryClient.ensureInfiniteQueryData(
				movieQueries.infiniteDiscover({ with_genres: params.genreId }),
			),
			session
				? context.queryClient.ensureQueryData(
						watchlistQueries.moviesByGenreId(params.genreId),
					)
				: null,
			session
				? context.queryClient.ensureQueryData(
						watchlistQueries.watchlistStatuses(),
					)
				: null,
		]);

		return {
			genres,
			movies,
			watchlistMovies,
			watchlistStatuses,
			isAuthenticated: !!session,
		};
	},
	component: DiscoverGenrePage,
	notFoundComponent: DiscoverGenrePageNotFound,
});

function DiscoverGenrePage() {
	const { isAuthenticated } = Route.useLoaderData();
	const { genreId } = Route.useParams();

	const { data: genres } = useSuspenseQuery(movieQueries.genres({}));
	const selectedGenre = genres.genres.find((genre) => genre.id === genreId);

	const { data: watchlistStatuses } = useQuery({
		...watchlistQueries.watchlistStatuses(),
		enabled: isAuthenticated,
	});
	const { data: watchlistMovies } = useQuery({
		...watchlistQueries.moviesByGenreId(genreId),
		enabled: isAuthenticated,
	});

	const {
		data: moviesPages,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useSuspenseInfiniteQuery(
		movieQueries.infiniteDiscover({ with_genres: genreId }),
	);

	const movies = useMemo(() => {
		const map = new Map();
		for (const page of moviesPages.pages) {
			for (const movie of page.results) {
				map.set(movie.id, movie);
			}
		}
		return [...map.values()];
	}, [moviesPages]);

	const sentinelRef = useInfiniteScrollTrigger(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, hasNextPage);

	return (
		<>
			<div className="relative isolate flex items-center justify-center">
				<BackButton className="self-start z-20" />
				<div className="absolute flex flex-col items-center gap-2 z-20">
					<h1 className="relative isolate text-2xl lg:text-4xl tracking-tight font-medium">
						{selectedGenre?.name}
						<div className="absolute bottom-0 translate-y-1/5 right-0 w-full scale-x-110 scale-y-120 h-3 -rotate-4 skew-3 bg-primary -z-10"></div>
					</h1>
					<p className="text-sm lg:text-base text-muted-foreground">
						Handpicked {selectedGenre?.name} films to add to your list
					</p>
				</div>
				<div className="pointer-events-none absolute inset-0 size-full bg-background/60 z-10"></div>
				<MovieBackdropMarquee
					movies={moviesPages.pages[0].results.map((movie) =>
						normalizeMovie(movie),
					)}
				/>
			</div>

			{isAuthenticated && (
				<section className="flex flex-col gap-4">
					<div className="flex justify-between">
						<h2 className="text-xl lg:text-2xl tracking-tighter">
							{selectedGenre?.name} Movies in Your Watchlist
						</h2>
						<Button variant="link" asChild>
							<Link to="/watchlist">See all</Link>
						</Button>
					</div>

					{watchlistMovies && watchlistStatuses ? (
						<MovieRow
							movies={watchlistMovies}
							watchlistStatuses={watchlistStatuses}
						/>
					) : null}
				</section>
			)}

			<section className="flex flex-col gap-4">
				<h2 className="text-xl lg:text-2xl tracking-tighter">
					{selectedGenre?.name} Popular
				</h2>
				<MovieGrid
					movies={movies.map((movie) => normalizeMovie(movie))}
					watchlistStatuses={watchlistStatuses}
				/>
				<div ref={sentinelRef} className="h-1" aria-hidden="true" />
			</section>
		</>
	);
}

function DiscoverGenrePageNotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-6 flex-1 h-full">
			<div className="flex flex-col items-center gap-2">
				<h1 className="relative isolate text-2xl lg:text-4xl tracking-tight font-medium">
					Oops
					<div className="absolute bottom-0 translate-y-1/5 right-0 w-full scale-x-110 scale-y-120 h-3 -rotate-4 skew-3 bg-primary -z-10"></div>
				</h1>
				<p className="text-sm lg:text-base text-muted-foreground">
					This genre doesn't exist
				</p>
			</div>
			<Button asChild>
				<Link to="/discover">Go home</Link>
			</Button>
		</div>
	);
}
