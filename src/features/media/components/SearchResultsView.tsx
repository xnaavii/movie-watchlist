import { useInfiniteQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { Button } from "#/components/ui/button";
import { looksLikeDescription } from "#/features/picks/utils/picks";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { mediaQueries, popularList } from "../queries";
import { mediaKey, uniqueMedia } from "../utils";
import {
	filterAndSortMedia,
	SEARCH_SORTS,
	type SearchFilters,
} from "../utils/filters";
import { normalizeText } from "../utils/search";
import { MediaCard } from "./MediaCard";
import { MediaFilterBar, type MediaFilterValues } from "./MediaFilterBar";
import { MediaRow } from "./MediaRow";

interface SearchResultsViewProps {
	/** The search text. Empty shows what's popular instead. */
	q: string;
	filters: SearchFilters;
	onFiltersChange: (patch: MediaFilterValues) => void;
	onClearFilters: () => void;
	/** Switches to AI picks for this query. */
	onAskAi: () => void;
}

/**
 * Title search results, or popular titles when nothing is typed: the person
 * a query names, a filterable grid that loads more on scroll, and an AI picks
 * suggestion when the query reads like a description.
 */
export function SearchResultsView({
	q,
	filters,
	onFiltersChange,
	onClearFilters,
	onAskAi,
}: SearchResultsViewProps) {
	const search = useInfiniteQuery(mediaQueries.infiniteSearch(q));
	const popular = useInfiniteQuery({
		...mediaQueries.infiniteList(popularList(filters.type)),
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

	const loadedMovies = uniqueMedia(data?.pages);
	const movies = filterAndSortMedia(loadedMovies, filters);

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

	const isDescriptive = looksLikeDescription(q);
	const firstSearchPage = q ? search.data?.pages[0] : undefined;
	// Titles like "The Dark Knight" can read like a mood, so an exact title hit
	// wins over the AI suggestion.
	const hasExactTitle = loadedMovies.some(
		(movie) => normalizeText(movie.title) === normalizeText(q),
	);
	const showAiSuggestion = isDescriptive && !hasExactTitle;
	const person = firstSearchPage?.person;
	const isFuzzy = firstSearchPage?.resolved.fuzzy ?? false;

	return (
		<>
			{showAiSuggestion && (
				<div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-primary/10 ring-1 ring-primary/20">
					<div className="flex items-center gap-3">
						<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
							<Sparkles className="size-4" />
						</span>
						<p className="text-sm text-pretty">
							<span className="font-medium">Describing a vibe?</span>{" "}
							<span className="text-muted-foreground">
								Get a few picks that match it, with a reason for each.
							</span>
						</p>
					</div>
					<Button variant="contrast" size="sm" onClick={onAskAi}>
						<Sparkles />
						Get AI picks
					</Button>
				</div>
			)}
			{q && search.isLoading ? (
				<p className="text-muted-foreground">Searching...</p>
			) : q && loadedMovies.length === 0 && !person ? (
				<p className="text-muted-foreground">No results for &quot;{q}&quot;</p>
			) : (
				<>
					{person && (
						<section>
							<MediaRow
								header={<h2 className="text-xl">Known for: {person.name}</h2>}
								items={person.credits}
							/>
						</section>
					)}
					{loadedMovies.length > 0 && (
						<section className="flex flex-col gap-6">
							<div className="flex flex-col gap-1">
								<h2 className="text-xl">
									{!q
										? filters.type === "tv"
											? "Popular TV shows"
											: "Popular movies"
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
							<MediaFilterBar
								values={filters}
								sortOptions={SEARCH_SORTS}
								showRating
								onChange={onFiltersChange}
								onClear={onClearFilters}
							/>
							{movies.length === 0 && (
								<div className="flex flex-col items-start gap-3">
									<p className="text-muted-foreground">
										None of the {loadedMovies.length} titles loaded so far match
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
								{movies.map((item) => (
									<MediaCard key={mediaKey(item)} media={item} />
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
		</>
	);
}
