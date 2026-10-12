import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SearchBar } from "#/components/SearchBar";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { MovieRow } from "#/features/movies/components/MovieRow";
import { movieQueries } from "#/features/movies/queries";
import { normalizeMovie } from "#/features/movies/utils";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";

const searchParamsSchema = z.object({
	q: z.string().catch(""),
});

export const Route = createFileRoute("/_app/search")({
	component: SearchPage,
	validateSearch: searchParamsSchema,
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: ({ context, deps }) => {
		if (deps.q) {
			context.queryClient.ensureInfiniteQueryData(
				movieQueries.infiniteSearch(deps.q),
			);
		} else {
			context.queryClient.ensureInfiniteQueryData(
				movieQueries.infiniteList("popular"),
			);
		}
	},
	pendingComponent: () => (
		<div className="p-2 md:p-6 mt-16 md:mt-0">
			<p className="text-muted-foreground">Loading...</p>
		</div>
	),
});

function SearchPage() {
	const { q } = Route.useSearch();
	const navigate = Route.useNavigate();
	const [draft, setDraft] = useState(q);

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (draft !== q) {
				navigate({ search: { q: draft }, replace: true });
			}
		}, 300);
		return () => clearTimeout(timerId);
	}, [draft, q, navigate]);

	const search = useInfiniteQuery(movieQueries.infiniteSearch(q));
	const popular = useInfiniteQuery({
		...movieQueries.infiniteList("popular"),
		enabled: !q,
	});
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isError,
		error,
	} = q ? search : popular;
	const sentinelRef = useInfiniteScrollTrigger(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, hasNextPage);

	if (isError) {
		return <p>There was an error: {error?.message}</p>;
	}

	const movies = Array.from(
		new Map(
			data?.pages
				.flatMap((page) => page.results)
				.map((movie) => [movie.id, movie]),
		).values(),
	);
	const firstSearchPage = q ? search.data?.pages[0] : undefined;
	const person = firstSearchPage?.person;
	const isFuzzy = firstSearchPage?.resolved.fuzzy ?? false;

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 mt-12 md:mt-0">
			<SearchBar value={draft} onChange={setDraft} />
			{q && search.isLoading ? (
				<p className="text-muted-foreground">Searching...</p>
			) : q && movies.length === 0 && !person ? (
				<p className="text-muted-foreground">No results for &quot;{q}&quot;</p>
			) : (
				<>
					{person && (
						<section className="flex flex-col gap-4">
							<h2 className="text-xl">Movies with {person.name}</h2>
							<MovieRow movies={person.movies.map(normalizeMovie)} />
						</section>
					)}
					{movies.length > 0 && (
						<section className="flex flex-col gap-6">
							<div className="flex flex-col gap-1">
								<h2 className="text-xl">
									{!q
										? "Popular movies"
										: isFuzzy
											? `Closest matches for ${q}`
											: `Showing results for ${q}`}
								</h2>
								{isFuzzy && (
									<p className="text-sm text-muted-foreground">
										No exact matches, so here are titles with a similar
										spelling.
									</p>
								)}
							</div>
							<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
								{movies.map((movie) => (
									<MovieCard key={movie.id} movie={normalizeMovie(movie)} />
								))}
								<div
									ref={sentinelRef}
									className="h-10 -mt-10 pointer-events-none"
								/>
							</div>
						</section>
					)}
				</>
			)}
		</div>
	);
}
