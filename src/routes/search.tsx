import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SearchBar } from "#/components/SearchBar";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { movieQueries } from "#/features/movies/queries";

const searchParamsSchema = z.object({
	q: z.string().catch(""),
});

export const Route = createFileRoute("/search")({
	component: SearchPage,
	validateSearch: searchParamsSchema,
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: ({ context, deps }) => {
		if (!deps.q) return;
		return context.queryClient.ensureQueryData(
			movieQueries.search({ query: deps.q }),
		);
	},
});

function SearchPage() {
	const { q } = Route.useSearch();
	const navigate = Route.useNavigate();

	const [draft, setDraft] = useState(q);

	useEffect(() => {
		const timerId = setTimeout(() => {
			navigate({ search: { q: draft }, replace: true });
		}, 300);
		return () => clearTimeout(timerId);
	}, [draft, navigate]);

	const { data, isLoading, isError, error } = useQuery(
		movieQueries.search({ query: q }),
	);

	if (isError) {
		return <p>There was an error: {error.message}</p>;
	}

	const movies = data?.results || [];

	return (
		<div className="flex flex-col gap-6 p-2 md:p-6 mt-16 md:mt-0">
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
				<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2.5">
					{movies.map((movie) => (
						<MovieCard
							key={movie.id}
							id={movie.id}
							title={movie.title}
							posterPath={movie.poster_path ?? null}
						/>
					))}
				</div>
			)}
		</div>
	);
}
