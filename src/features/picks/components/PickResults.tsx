import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button, ButtonLabel } from "#/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#/components/ui/empty";
import { Skeleton } from "#/components/ui/skeleton";
import { MediaCard } from "#/features/media/components/MediaCard";
import { MediaCardSkeleton } from "#/features/media/components/MediaCardSkeleton";
import { MEDIA_GRID_CLASS } from "#/features/media/components/MediaGrid";
import { normalizeMovie } from "#/features/media/utils";
import { cn } from "#/lib/utils";
import { picksQueries } from "../queries";
import { PICK_ERRORS, type PickRequest } from "../types";
import { PickCard } from "./PickCard";

// The shared title grid, with 2 columns on phones and more room between rows
// because each pick has its reason written under the poster.
const GRID = cn(MEDIA_GRID_CLASS, "grid-cols-2 gap-y-6");

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
					size="responsive-sm"
					onClick={onPickAgain}
					disabled={isFetching}
				>
					<RefreshCw
						data-icon="inline-start"
						className={isFetching ? "animate-spin" : undefined}
					/>
					<ButtonLabel>Pick again</ButtonLabel>
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
								<MediaCard media={normalizeMovie(movie)} />
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
						<MediaCardSkeleton />
						<Skeleton className="h-4 w-2/3 rounded-full" />
						<Skeleton className="h-3 w-full rounded-full" />
					</li>
				))}
			</ol>
		</section>
	);
}

function errorDescription(message: string) {
	if (message === PICK_ERRORS.notConfigured) {
		return "AI picks aren't set up on this server yet.";
	}
	if (message === PICK_ERRORS.rateLimited) {
		return "That's a lot of picks in a row. Give it a minute and try again.";
	}
	return message;
}

function PickResultsError({ message }: { message: string }) {
	return (
		<Empty className="bg-muted rounded-4xl">
			<EmptyHeader>
				<EmptyMedia variant="icon" className="bg-primary/10 text-primary">
					<Sparkles />
				</EmptyMedia>
				<EmptyTitle>Couldn't pick right now</EmptyTitle>
				<EmptyDescription>{errorDescription(message)}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
