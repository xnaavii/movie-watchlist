import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { type SubmitEvent, useEffect, useState } from "react";
import { z } from "zod";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { SearchBar } from "#/components/SearchBar";
import { Button } from "#/components/ui/button";
import { MediaGridPagePending } from "#/features/media/components/DiscoverPageStates";
import { MediaCard } from "#/features/media/components/MediaCard";
import {
	MediaFilterBar,
	type MediaFilterValues,
} from "#/features/media/components/MediaFilterBar";
import { MediaRow } from "#/features/media/components/MediaRow";
import { mediaQueries } from "#/features/media/queries";
import type { MediaType } from "#/features/media/types";
import { mediaKey } from "#/features/media/utils";
import {
	filterAndSortMedia,
	SEARCH_SORTS,
	type SearchFilters,
	searchFilterSearchSchema,
} from "#/features/media/utils/filters";
import { normalizeText } from "#/features/media/utils/search";
import {
	DEFAULT_PICK_OPTIONS,
	type PickOptions,
	PickOptionsBar,
	pickOptionsFromSearch,
	pickOptionsToSearch,
	pickSearchSchema,
	toPickRequest,
} from "#/features/picks/components/PickOptionsBar";
import { PickPill } from "#/features/picks/components/PickPill";
import { PickPromptField } from "#/features/picks/components/PickPromptField";
import { PickResults } from "#/features/picks/components/PickResults";
import type { PickRequest } from "#/features/picks/types";
import { looksLikeDescription } from "#/features/picks/utils/picks";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";

const searchParamsSchema = searchFilterSearchSchema
	.extend(pickSearchSchema.shape)
	.extend({
		q: z.string().catch(""),
		ai: z.boolean().optional().catch(undefined),
	});

/** Clears the AI picks params when leaving AI mode. */
const NO_PICK_SEARCH = pickOptionsToSearch(DEFAULT_PICK_OPTIONS);

/** With no query, the page shows what's popular in the picked type. */
const popularList = (type: MediaType | undefined) =>
	type === "tv"
		? ({ mediaType: "tv", list: "popular" } as const)
		: ({ mediaType: "movie", list: "popular" } as const);

export const Route = createFileRoute("/_app/search")({
	component: SearchPage,
	validateSearch: searchParamsSchema,
	loaderDeps: ({ search }) => ({
		q: search.q,
		ai: search.ai,
		type: search.type,
	}),
	loader: ({ context, deps }) => {
		if (deps.ai) return;
		if (deps.q) {
			context.queryClient.infiniteQuery({
				...mediaQueries.infiniteSearch(deps.q),
				staleTime: "static",
			});
		} else {
			context.queryClient.infiniteQuery({
				...mediaQueries.infiniteList(popularList(deps.type)),
				staleTime: "static",
			});
		}
	},
	pendingComponent: () => <MediaGridPagePending withSearchField />,
});

function SearchPage() {
	const { q, ai, mood, time, company, watchlist, attempt, ...filters } =
		Route.useSearch();
	const navigate = Route.useNavigate();
	const [draft, setDraft] = useState(q);
	const [pickOptions, setPickOptions] = useState<PickOptions>(() =>
		pickOptionsFromSearch({ mood, time, company, watchlist }),
	);
	// AI picks only run when asked for, since each one is an AI call. The run
	// is rebuilt from the URL on the way back, so it hits the cached answer.
	const [pickRequest, setPickRequest] = useState<PickRequest | null>(() =>
		ai && q ? toPickRequest(q, pickOptions) : null,
	);
	const aiAttempt = attempt ?? 0;
	const isDescriptive = looksLikeDescription(q);

	useEffect(() => {
		if (ai) return;
		const timerId = setTimeout(() => {
			if (draft !== q) {
				navigate({
					search: (prev) => ({ ...prev, q: draft, ai: undefined }),
					replace: true,
				});
			}
		}, 300);
		return () => clearTimeout(timerId);
	}, [ai, draft, q, navigate]);

	function askAi(prompt: string, options = pickOptions) {
		setPickRequest(toPickRequest(prompt, options));
		navigate({
			search: (prev) => ({
				...prev,
				...pickOptionsToSearch(options),
				q: prompt.trim(),
				ai: true,
			}),
			replace: true,
		});
	}

	function setMode(useAi: boolean) {
		if (useAi === !!ai) return;
		setPickRequest(null);
		navigate({
			search: (prev) => ({
				...prev,
				...NO_PICK_SEARCH,
				q: draft,
				ai: useAi || undefined,
			}),
			replace: true,
		});
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		if (ai) askAi(draft);
	}

	const search = useInfiniteQuery({
		...mediaQueries.infiniteSearch(q),
		enabled: !ai,
	});
	const popular = useInfiniteQuery({
		...mediaQueries.infiniteList(popularList(filters.type)),
		enabled: !q && !ai,
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
				.map((item) => [mediaKey(item), item]),
		).values(),
	);
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

	if (!ai && isError && !data) {
		return <p>There was an error: {error?.message}</p>;
	}

	function updateFilters(patch: MediaFilterValues) {
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
	const showAiSuggestion = isDescriptive && !hasExactTitle;
	const person = firstSearchPage?.person;
	const isFuzzy = firstSearchPage?.resolved.fuzzy ?? false;

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<PickPill selected={!ai} onClick={() => setMode(false)}>
						Titles
					</PickPill>
					<PickPill selected={!!ai} onClick={() => setMode(true)}>
						<Sparkles />
						AI picks
					</PickPill>
				</div>
				{ai ? (
					<>
						<PickPromptField value={draft} onChange={setDraft} />
						<PickOptionsBar
							values={pickOptions}
							onChange={(patch) =>
								setPickOptions((prev) => ({ ...prev, ...patch }))
							}
						/>
					</>
				) : (
					<SearchBar value={draft} onChange={setDraft} />
				)}
			</form>
			{ai ? (
				pickRequest ? (
					<PickResults
						request={pickRequest}
						attempt={aiAttempt}
						onPickAgain={() =>
							navigate({
								search: (prev) => ({ ...prev, attempt: aiAttempt + 1 }),
								replace: true,
							})
						}
					/>
				) : (
					<p className="text-muted-foreground text-pretty">
						Describe a mood, a plot or a film you liked, add any options, and
						you'll get a few picks with a reason for each.
					</p>
				)
			) : (
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
							<Button variant="contrast" size="sm" onClick={() => askAi(q)}>
								<Sparkles />
								Get AI picks
							</Button>
						</div>
					)}
					{q && search.isLoading ? (
						<p className="text-muted-foreground">Searching...</p>
					) : q && loadedMovies.length === 0 && !person ? (
						<p className="text-muted-foreground">
							No results for &quot;{q}&quot;
						</p>
					) : (
						<>
							{person && (
								<section>
									<MediaRow
										header={
											<h2 className="text-xl">Known for: {person.name}</h2>
										}
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
										onChange={updateFilters}
										onClear={() =>
											navigate({ search: { q, ai }, replace: true })
										}
									/>
									{movies.length === 0 && (
										<div className="flex flex-col items-start gap-3">
											<p className="text-muted-foreground">
												None of the {loadedMovies.length} titles loaded so far
												match these filters.
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
			)}
		</div>
	);
}
