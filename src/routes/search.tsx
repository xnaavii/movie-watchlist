import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SearchBar } from "#/components/SearchBar";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { movieQueries } from "#/features/movies/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";

const searchParamsSchema = z.object({
	q: z.string().catch(""),
});

export const Route = createFileRoute("/search")({
	component: SearchPage,
	validateSearch: searchParamsSchema,
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: ({ context, deps }) => {
		if (!deps.q) return;
		context.queryClient.ensureInfiniteQueryData(
			movieQueries.infiniteSearch({ query: deps.q }),
		);
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

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
	} = useInfiniteQuery(movieQueries.infiniteSearch({ query: q }));
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

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8  mt-16 md:mt-0">
			<SearchBar value={draft} onChange={setDraft} />
			{!q ? (
				<p className="text-muted-foreground">
					Start typing to search for movies.
				</p>
			) : isLoading ? (
				<p className="text-muted-foreground">Searching...</p>
			) : movies.length === 0 ? (
				<p className="text-muted-foreground">No results for &quot;{q}&quot;</p>
			) : (
				<div className="flex flex-col gap-6">
					<h2 className="text-xl">Showing results for {q}</h2>
					<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
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
			)}
		</div>
	);
}
