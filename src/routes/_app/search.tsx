import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { type SubmitEvent, useEffect, useState } from "react";
import { z } from "zod";
import { SearchBar } from "#/components/SearchBar";
import { MediaGridPagePending } from "#/features/media/components/DiscoverPageStates";
import type { MediaFilterValues } from "#/features/media/components/MediaFilterBar";
import { SearchResultsView } from "#/features/media/components/SearchResultsView";
import { mediaQueries, popularList } from "#/features/media/queries";
import {
	type SearchFilters,
	searchFilterSearchSchema,
} from "#/features/media/utils/filters";
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
import { pageHead, pageTitle, truncateTitle } from "#/utils/seo";

const searchParamsSchema = searchFilterSearchSchema
	.extend(pickSearchSchema.shape)
	.extend({
		q: z.string().catch(""),
		ai: z.boolean().optional().catch(undefined),
	});

/** Clears the AI picks params when leaving AI mode. */
const NO_PICK_SEARCH = pickOptionsToSearch(DEFAULT_PICK_OPTIONS);

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
	head: ({ match: { search } }) =>
		pageHead({
			title: pageTitle(
				search.ai
					? "AI picks"
					: search.q
						? `Search: ${truncateTitle(search.q)}`
						: "Search",
			),
			description: search.ai
				? "Describe what you're in the mood for and get a short list of movies and shows, each with a reason to watch."
				: "Search movies, TV shows and people, or describe a mood and get AI picks.",
			noindex: true,
		}),
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

	function updateFilters(patch: MediaFilterValues) {
		navigate({
			search: (prev) => ({ ...prev, ...(patch as Partial<SearchFilters>) }),
			replace: true,
		});
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		if (ai) askAi(draft);
	}

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
				<SearchResultsView
					q={q}
					filters={filters}
					onFiltersChange={updateFilters}
					onClearFilters={() => navigate({ search: { q, ai }, replace: true })}
					onAskAi={() => askAi(q)}
				/>
			)}
		</div>
	);
}
