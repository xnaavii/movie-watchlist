import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SearchBar } from "#/components/SearchBar";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { searchMovies } from "#/features/movies/server/movies.functions";

const searchParamsSchema = z.object({
	q: z.string().catch(""),
});

const movieSearchQuery = (query: string) =>
	queryOptions({
		queryKey: ["movies", "search", query],
		queryFn: () => searchMovies({ data: { query } }),
		enabled: query.trim().length > 0,
	});

export const Route = createFileRoute("/search")({
	component: SearchPage,
	validateSearch: searchParamsSchema,
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: ({ context, deps }) => {
		if (!deps.q) return;
		return context.queryClient.ensureQueryData(movieSearchQuery(deps.q));
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

	const { data, isPending } = useQuery(movieSearchQuery(q));
	const movies = data?.success ? data.data.results : [];

	return (
		<div className="flex flex-col gap-6 p-6">
			<SearchBar value={draft} onChange={setDraft} />

			{!q ? (
				<p className="text-muted-foreground">
					Start typing to search for movies.
				</p>
			) : isPending ? (
				<p className="text-muted-foreground">Searching...</p>
			) : movies.length === 0 ? (
				<p className="text-muted-foreground">No results for &quot;{q}&quot;</p>
			) : (
				<div className="grid grid-cols-6 gap-4">
					{movies.map((movie) => (
						<MovieCard
							key={movie.id}
							id={movie.id}
							title={movie.title}
							imageSrc={movie.poster_path}
						/>
					))}
				</div>
			)}
		</div>
	);
}
