import type { MovieResultItem } from "@lorenzopant/tmdb";
import {
	type QueryKey,
	type UseSuspenseQueryOptions,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { normalizeMovie } from "../utils";
import { MovieRow } from "./MovieRow";
import { MovieRowSkeleton } from "./MovieRowSkeleton";

type MovieResults = { results: MovieResultItem[] };

interface DiscoverMovieSectionProps<
	TData extends MovieResults,
	TQueryKey extends QueryKey,
> {
	title: string;
	description: string;
	query: UseSuspenseQueryOptions<TData, Error, TData, TQueryKey>;
	watchlistStatuses?: Record<number, WatchlistStatus>;
}

/**
 * A titled movie row that loads on its own, so a slow or failing TMDB request
 * only affects its own section instead of the whole discover page.
 */
export function DiscoverMovieSection<
	TData extends MovieResults,
	TQueryKey extends QueryKey,
>(props: DiscoverMovieSectionProps<TData, TQueryKey>) {
	return (
		<ErrorBoundary fallback={null}>
			<Suspense fallback={<MovieRowSkeleton />}>
				<DiscoverMovieSectionContent {...props} />
			</Suspense>
		</ErrorBoundary>
	);
}

function DiscoverMovieSectionContent<
	TData extends MovieResults,
	TQueryKey extends QueryKey,
>({
	title,
	description,
	query,
	watchlistStatuses,
}: DiscoverMovieSectionProps<TData, TQueryKey>) {
	const { data } = useSuspenseQuery(query);

	if (data.results.length === 0) return null;

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="text-xl lg:text-2xl tracking-tighter">{title}</h2>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<MovieRow
				movies={data.results.map((movie) => normalizeMovie(movie))}
				watchlistStatuses={watchlistStatuses}
			/>
		</section>
	);
}
