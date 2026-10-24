import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { MovieGrid } from "#/features/movies/components/MovieGrid";
import { movieQueries } from "#/features/movies/queries";
import { normalizeMovie } from "#/features/movies/utils";
import { picksQueries } from "../queries";
import { PICK_ERRORS, type PickRequest } from "../types";
import { PickCard } from "./PickCard";

type PickResultsProps = {
	request: PickRequest;
	attempt: number;
	onPickAgain: () => void;
	/** Shows the wider list of matches under the picks. */
	showMore?: boolean;
};

export function PickResults({
	request,
	attempt,
	onPickAgain,
	showMore = true,
}: PickResultsProps) {
	const { data, isPending, isError, error, isFetching } = useQuery(
		picksQueries.picks(request, attempt),
	);
	const { data: genres } = useQuery(movieQueries.genres({}));
	const genreNames = new Map(
		genres?.genres.map((genre) => [genre.id, genre.name]),
	);

	if (isPending) return <PickResultsPending />;
	if (isError) return <PickResultsError message={error.message} />;

	return (
		<section className="flex flex-col gap-6" aria-live="polite">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">Picked for you</p>
					<h2 className="text-xl md:text-2xl font-semibold text-balance">
						{data.summary}
					</h2>
				</div>
				<Button variant="outline" onClick={onPickAgain} disabled={isFetching}>
					<RefreshCw />
					Pick again
				</Button>
			</div>

			{data.picks.length === 0 ? (
				<p className="text-muted-foreground">
					Nothing matched that closely. Try loosening the time or mood.
				</p>
			) : (
				<ol className="grid gap-3 lg:grid-cols-2">
					{data.picks.map((pick, index) => (
						<PickCard
							key={pick.movie.id}
							pick={pick}
							rank={index + 1}
							genreNames={genreNames}
						/>
					))}
				</ol>
			)}

			{showMore && data.more.length > 0 && (
				<section className="flex flex-col gap-4 pt-4">
					<h3 className="text-lg font-semibold">More that fit</h3>
					<MovieGrid movies={data.more.map(normalizeMovie)} />
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
					Reading your mood and looking through the catalogue…
				</p>
				<Skeleton className="h-7 w-72 max-w-full rounded-full" />
			</div>
			<ol className="grid gap-3 lg:grid-cols-2">
				{Array.from({ length: 4 }, (_, i) => (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
						key={i}
						className="flex gap-4 p-3 md:p-4 rounded-3xl ring-1 ring-border"
					>
						<Skeleton className="w-24 md:w-28 aspect-2/3 rounded-2xl" />
						<div className="flex flex-col gap-2 flex-1 py-1">
							<Skeleton className="h-5 w-2/3 rounded-full" />
							<Skeleton className="h-4 w-1/3 rounded-full" />
							<Skeleton className="h-4 w-full rounded-full mt-2" />
							<Skeleton className="h-4 w-5/6 rounded-full" />
						</div>
					</li>
				))}
			</ol>
		</section>
	);
}

function PickResultsError({ message }: { message: string }) {
	const location = useLocation();

	if (message === PICK_ERRORS.signedOut) {
		return (
			<div className="flex flex-col items-start gap-3 p-6 rounded-3xl ring-1 ring-border">
				<h2 className="text-lg font-semibold">Sign in to get picks</h2>
				<p className="text-muted-foreground">
					Picks use your watchlist and what you have already seen, so you need
					an account.
				</p>
				<Button variant="contrast" asChild>
					<Link to="/auth/login" search={{ redirect: location.href }}>
						Sign in
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1 p-6 rounded-3xl ring-1 ring-border">
			<h2 className="text-lg font-semibold">Couldn't pick right now</h2>
			<p className="text-muted-foreground">
				{message === PICK_ERRORS.notConfigured
					? "AI picks aren't set up on this server yet."
					: message}
			</p>
		</div>
	);
}
