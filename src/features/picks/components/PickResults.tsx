import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#/components/ui/empty";
import { Skeleton } from "#/components/ui/skeleton";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { MovieCardSkeleton } from "#/features/movies/components/MovieCardSkeleton";
import { normalizeMovie } from "#/features/movies/utils";
import { picksQueries } from "../queries";
import { PICK_ERRORS, type PickRequest } from "../types";
import { PickCard } from "./PickCard";

// Same grid as the search results, so picks and titles line up.
const GRID =
	"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-2.5 gap-y-6";

type PickResultsProps = {
	request: PickRequest;
	attempt: number;
	onPickAgain: () => void;
};

export function PickResults({
	request,
	attempt,
	onPickAgain,
}: PickResultsProps) {
	const { data, isPending, isError, error, isFetching } = useQuery(
		picksQueries.picks(request, attempt),
	);

	if (isPending) return <PickResultsPending />;
	if (isError) return <PickResultsError message={error.message} />;

	return (
		<section className="flex flex-col gap-6" aria-live="polite">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-col gap-1">
					<p className="flex items-center gap-1.5 text-sm font-medium text-primary">
						<Sparkles className="size-4" />
						Picked for you
					</p>
					<h2 className="text-xl text-balance">{data.summary}</h2>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={onPickAgain}
					disabled={isFetching}
				>
					<RefreshCw className={isFetching ? "animate-spin" : undefined} />
					Pick again
				</Button>
			</div>

			{data.picks.length === 0 ? (
				<p className="text-muted-foreground">
					Nothing matched that closely. Try a looser description or fewer
					options.
				</p>
			) : (
				<ol className={GRID}>
					{data.picks.map((pick, index) => (
						<PickCard key={pick.movie.id} pick={pick} rank={index + 1} />
					))}
				</ol>
			)}

			{data.more.length > 0 && (
				<section className="flex flex-col gap-6 pt-4">
					<h2 className="text-xl">More that fit</h2>
					<ul className={GRID}>
						{data.more.map((movie) => (
							<li key={movie.id}>
								<MovieCard movie={normalizeMovie(movie)} />
							</li>
						))}
					</ul>
				</section>
			)}
		</section>
	);
}

function PickResultsPending() {
	return (
		<section className="flex flex-col gap-6" aria-busy="true">
			<div className="flex flex-col gap-2">
				<p className="text-sm text-muted-foreground">
					Reading your request and looking through the catalogue…
				</p>
				<Skeleton className="h-7 w-72 max-w-full rounded-full" />
			</div>
			<ol className={GRID}>
				{Array.from({ length: 5 }, (_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
					<li key={i} className="flex flex-col gap-2">
						<MovieCardSkeleton />
						<Skeleton className="h-4 w-2/3 rounded-full" />
						<Skeleton className="h-3 w-full rounded-full" />
					</li>
				))}
			</ol>
		</section>
	);
}

function PickResultsError({ message }: { message: string }) {
	const location = useLocation();
	const signedOut = message === PICK_ERRORS.signedOut;

	return (
		<Empty className="bg-muted rounded-4xl">
			<EmptyHeader>
				<EmptyMedia variant="icon" className="bg-primary/10 text-primary">
					<Sparkles />
				</EmptyMedia>
				<EmptyTitle>
					{signedOut ? "Sign in to get AI picks" : "Couldn't pick right now"}
				</EmptyTitle>
				<EmptyDescription>
					{signedOut
						? "Picks use your watchlist and what you've already seen, so you need an account."
						: message === PICK_ERRORS.notConfigured
							? "AI picks aren't set up on this server yet."
							: message}
				</EmptyDescription>
			</EmptyHeader>
			{signedOut && (
				<EmptyContent>
					<Button variant="contrast" asChild>
						<Link to="/auth/login" search={{ redirect: location.href }}>
							Sign in
						</Link>
					</Button>
				</EmptyContent>
			)}
		</Empty>
	);
}
