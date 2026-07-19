import type { LanguageISO6391 } from "@lorenzopant/tmdb";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { GenreFilter } from "#/features/movies/components/GenreFilter";
import { LanguageFilter } from "#/features/movies/components/LanguageFilter";
import { MinRatingFilter } from "#/features/movies/components/MinRatingFilter";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { MoviesCarousel } from "#/features/movies/components/MoviesCarousel";
import { SortByFilter } from "#/features/movies/components/SortByFilter";
import { YearFilter } from "#/features/movies/components/YearFilter";
import { movieQueries } from "#/features/movies/queries";
import { buildDiscoverParams } from "#/features/movies/utils";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { seo } from "#/utils/seo";

const discoverMoviesSchema = z.object({
	genreId: z.coerce.number().optional(),
	year: z.coerce.number().optional(),
	sortBy: z
		.enum([
			"popularity.desc",
			"vote_average.desc",
			"primary_release_date.desc",
			"revenue.desc",
		])
		.optional(),
	minRating: z.coerce.number().min(0).max(10).optional(),
	language: z.string().length(2).optional(),
});

type DiscoverMoviesSearch = Omit<
	z.infer<typeof discoverMoviesSchema>,
	"language"
> & {
	language?: LanguageISO6391;
};

export const Route = createFileRoute("/discover")({
	component: DiscoverPage,
	pendingComponent: () => {
		const skeletonItems = Array.from({ length: 5 }, (_, i) => ({
			id: i,
		}));

		return (
			<div className="flex flex-col gap-6 p-4 md:p-10 mt-10 md:mt-0 animate-pulse">
				<div className="w-full h-[40vh] bg-muted rounded-2xl" />
				<div className="flex gap-2">
					{skeletonItems.map((item) => (
						<div key={item.id} className="h-9 w-24 bg-muted rounded-full" />
					))}
				</div>
				<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
					{skeletonItems.map((item) => (
						<div key={item.id} className="aspect-2/3 bg-muted rounded-lg" />
					))}
				</div>
			</div>
		);
	},
	errorComponent: ({ error }) => (
		<div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-center px-4">
			<h1 className="text-2xl font-medium tracking-tighter">
				Something went wrong
			</h1>
			<p className="text-muted-foreground">{error.message}</p>
			<Button asChild>
				<Link to="/discover">Try again</Link>
			</Button>
		</div>
	),
	validateSearch: (search): DiscoverMoviesSearch =>
		discoverMoviesSchema.parse(search) as DiscoverMoviesSearch,
	loaderDeps: ({ search }) => ({
		genreId: search.genreId,
		year: search.year,
		sortBy: search.sortBy,
		minRating: search.minRating,
		language: search.language,
	}),
	loader: async ({ context, deps }) => {
		const [genres, , movies] = await Promise.all([
			context.queryClient.ensureQueryData(movieQueries.genres({})),
			context.queryClient.ensureQueryData(movieQueries.languages()),
			context.queryClient.ensureInfiniteQueryData(
				movieQueries.discover(buildDiscoverParams(deps)),
			),
		]);
		return { genres, movies, ...deps };
	},
	head: ({ loaderData }) => {
		const selectedGenre = loaderData?.genres.genres.find(
			(genre) => genre.id === loaderData?.genreId,
		);
		const firstMovie = loaderData?.movies?.pages?.[0]?.results?.[0];
		const posterImage = firstMovie?.poster_path
			? `https://image.tmdb.org/t/p/w500${firstMovie.poster_path}`
			: undefined;

		return {
			meta: seo({
				title: selectedGenre
					? `${selectedGenre.name} Movies | ${SITE_CONFIG.name}`
					: `Discover Movies | ${SITE_CONFIG.name}`,
				description: selectedGenre
					? `Browse the best ${selectedGenre.name.toLowerCase()} movies to watch right now.`
					: "Discover popular, top rated, upcoming, and now playing movies.",
				image: posterImage,
				url: `${SITE_CONFIG.url}/discover`,
			}),
		};
	},
});

function DiscoverPage() {
	const { genreId, year, sortBy, minRating, language } = Route.useSearch();
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(
			movieQueries.discover(
				buildDiscoverParams({ genreId, year, sortBy, minRating, language }),
			),
		);

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
		<div className="flex flex-col gap-6 p-4 md:p-10 mt-10 md:mt-0">
			<MoviesCarousel movies={movies} />
			<div className="flex items-center gap-2 flex-wrap">
				<YearFilter />
				<GenreFilter />
				<LanguageFilter />
				<MinRatingFilter />
				<SortByFilter />
			</div>

			<div className="flex flex-col gap-6">
				<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
					{movies.map((movie) => (
						<MovieCard
							key={movie.id}
							id={movie.id}
							title={movie.title}
							posterPath={movie.poster_path ?? null}
						/>
					))}
					<div ref={sentinelRef} className="h-10 -mt-10 pointer-events-none" />
				</div>
			</div>
		</div>
	);
}
