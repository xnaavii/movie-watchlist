import { Sparkles } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { MovieCard } from "#/features/movies/components/MovieCard";
import { normalizeMovie } from "#/features/movies/utils";
import type { Pick } from "../types";

type PickCardProps = {
	pick: Pick;
	rank: number;
};

/** A regular movie card with the reason it was picked underneath. */
export function PickCard({ pick, rank }: PickCardProps) {
	return (
		<li className="flex flex-col gap-2 min-w-0">
			<div className="relative">
				<MovieCard
					movie={normalizeMovie(pick.movie)}
					watchlistStatus={pick.onWatchlist ? "want_to_watch" : undefined}
				/>
				<Badge
					variant={rank === 1 ? "default" : "secondary"}
					className="absolute top-3 left-3 z-30 tabular-nums pointer-events-none"
				>
					{rank === 1 && <Sparkles data-icon="inline-start" />}
					{rank === 1 ? "Top pick" : `#${rank}`}
				</Badge>
			</div>
			<div className="flex flex-col gap-1 px-1">
				<h3 className="text-sm md:text-base font-semibold line-clamp-1">
					{pick.movie.title}
				</h3>
				<p className="text-xs md:text-sm text-muted-foreground text-pretty">
					{pick.reason}
				</p>
			</div>
		</li>
	);
}
