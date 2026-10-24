import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { SearchBar } from "#/components/SearchBar";
import { Button } from "#/components/ui/button";
import { MovieCard } from "#/features/movies/components/MovieCard";
import {
	MovieFilterBar,
	type MovieFilterValues,
} from "#/features/movies/components/MovieFilterBar";
import { MovieRow } from "#/features/movies/components/MovieRow";
import { movieQueries } from "#/features/movies/queries";
import { normalizeMovie } from "#/features/movies/utils";
import {
	filterAndSortMovies,
	SEARCH_SORTS,
	type SearchFilters,
	searchFilterSearchSchema,
} from "#/features/movies/utils/filters";
import { normalizeText } from "#/features/movies/utils/search";
import { PickResults } from "#/features/picks/components/PickResults";
import { looksLikeDescription } from "#/features/picks/utils/picks";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";

const searchParamsSchema = searchFilterSearchSchema.extend({
	q: z.string().catch(""),
	ai: z.boolean().optional().catch(undefined),
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
	const { q, ai, ...filters } = Route.useSearch();
	const navigate = Route.useNavigate();
	const [draft, setDraft] = useState(q);
	const [aiAttempt, setAiAttempt] = useState(0);
	const isDescriptive = looksLikeDescription(q);

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (draft !== q) {
				navigate({
					search: (prev) => ({ ...prev, q: draft, ai: undefined }),
					replace: true,
				});
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
		isFetchNextPageError,
		isError,
		error,
	} = q ? search : popular;

	const loadedMovies = Array.from(
		new Map(
			data?.pages
				.flatMap((page) => page.results)
				.map((movie) => [movie.id, movie]),
		).values(),
	);
	const movies = filterAndSortMovies(loadedMovies, filters);

	// When filters hide everything loaded so far, "Look further" takes over so
	// the page does not page through the whole catalogue on its own.
	const sentinelRef = useInfiniteScrollTrigger({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		itemCount: movies.length,
		disabled: isFetchNextPageError || movies.length === 0,
	});

	if (isError && !data) {
		return <p>There was an error: {error?.message}</p>;
	}

	function updateFilters(patch: MovieFilterValues) {
		navigate({
			search: (prev) => ({ ...prev, ...(patch as Partial<SearchFilters>) }),
			replace: true,
		});
	}

	const firstSearchPage = q ? search.data?.pages[0] : undefined;
	// Titles like "The Dark Knight" can read like a mood, so an exact title hit
	// wins over the AI suggestion.
	const hasExactTitle = loadedMovies.some(
		(movie) => normalizeText(movie.title) === normalizeText(q),
	);
	const showAiPicks = isDescriptive && (ai || !hasExactTitle);
	const person = firstSearchPage?.person;
	const isFuzzy = firstSearchPage?.resolved.fuzzy ?? false;

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 mt-12 md:mt-0">
			<SearchBar value={draft} onChange={setDraft} />
			{showAiPicks &&
				(ai ? (
					<PickResults
						request={{
							prompt: q,
							moods: [],
							time: "any",
							company: undefined,
							useWatchlist: false,
						}}
						attempt={aiAttempt}
						onPickAgain={() => setAiAttempt((n) => n + 1)}
						showMore={false}
					/>
				) : (
					<div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl ring-1 ring-border">
						<p className="text-sm text-pretty">
							<span className="font-medium">Describing a vibe?</span>{" "}
							<span className="text-muted-foreground">
								Get a few picks that match it, with a reason for each.
							</span>
						</p>
						<Button
							variant="contrast"
							onClick={() =>
								navigate({
									search: (prev) => ({ ...prev, ai: true }),
									replace: true,
								})
							}
						>
							<Sparkles />
							Get AI picks
						</Button>
					</div>
				))}
			{q && search.isLoading ? (
				<p className="text-muted-foreground">Searching...</p>
			) : q && loadedMovies.length === 0 && !person ? (
				<p className="text-muted-foreground">No results for &quot;{q}&quot;</p>
			) : (
				<>
					{person && (
						<section className="flex flex-col gap-4">
							<h2 className="text-xl">Movies with {person.name}</h2>
							<MovieRow movies={person.movies.map(normalizeMovie)} />
						</section>
					)}
					{loadedMovies.length > 0 && (
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
							<MovieFilterBar
								values={filters}
								sortOptions={SEARCH_SORTS}
								showRating
								onChange={updateFilters}
								onClear={() => navigate({ search: { q, ai }, replace: true })}
							/>
							{movies.length === 0 && (
								<div className="flex flex-col items-start gap-3">
									<p className="text-muted-foreground">
										None of the {loadedMovies.length} movies loaded so far match
										these filters.
									</p>
									{hasNextPage && (
										<Button
											variant="outline"
											onClick={() => fetchNextPage()}
											disabled={isFetchingNextPage}
										>
											{isFetchingNextPage ? "Loading..." : "Look further"}
										</Button>
									)}
								</div>
							)}
							<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
								{movies.map((movie) => (
									<MovieCard key={movie.id} movie={normalizeMovie(movie)} />
								))}
							</div>
							{movies.length > 0 && (
								<InfiniteScrollFooter
									ref={sentinelRef}
									isFetchingNextPage={isFetchingNextPage}
									isError={isFetchNextPageError}
									onRetry={() => fetchNextPage()}
								/>
							)}
						</section>
					)}
				</>
			)}
		</div>
	);
}
