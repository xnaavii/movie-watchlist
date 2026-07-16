import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Item, ItemContent, ItemGroup, ItemTitle } from "#/components/ui/item";
import { FeaturedMovies } from "#/features/movies/components/FeaturedMovies";
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
			context.queryClient.ensureQueryData(movieQueries.list("now_playing")),
			getMovieGenres(),
		]);
	},
});

function DiscoverPage() {
	const { data } = useSuspenseQuery(movieQueries.list("now_playing"));
	const { genres } = Route.useLoaderData()[1];
	const { genreId } = Route.useSearch();

	return (
		<div className="flex flex-col gap-6">
			<FeaturedMovies movies={data.results} />
			<ItemGroup className="p-6 flex flex-row items-center gap-2.5 overflow-x-auto scrollbar-none">
				{genres?.map((genre) => (
					<Item
						key={genre.id}
						variant={genreId === genre.id ? "default" : "outline"}
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
			<div className="flex flex-col gap-20 p-2 md:p-6">
				<MoviesSection title="Popular" list="popular" />
				<MoviesSection title="In Theaters" list="now_playing" />
				<MoviesSection title="Upcoming" list="upcoming" />
				<MoviesSection title="Top Rated" list="top_rated" />
			</div>
		</div>
	);
}
