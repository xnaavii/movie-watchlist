import { Link } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import { formatReleaseYear } from "#/features/movies/utils";
import { toMovieSlug } from "#/features/movies/utils/slug";
import { WatchlistStatusButtonView } from "#/features/watchlist/components/WatchlistStatusButton";
import type { Pick } from "../types";

type PickCardProps = {
	pick: Pick;
	rank: number;
	genreNames: Map<number, string>;
};

export function PickCard({ pick, rank, genreNames }: PickCardProps) {
	const { movie, reason, onWatchlist } = pick;
	const slug = toMovieSlug(movie);
	const genres = movie.genre_ids
		.map((id) => genreNames.get(id))
		.filter(Boolean)
		.slice(0, 2)
		.join(", ");

	return (
		<li className="flex gap-4 md:gap-5 p-3 md:p-4 rounded-3xl bg-card ring-1 ring-border">
			<Link
				to="/movies/$movieSlug"
				params={{ movieSlug: slug }}
				className="shrink-0 w-24 md:w-28 rounded-2xl overflow-hidden focus-visible:ring-3 focus-visible:ring-ring/30 outline-none"
			>
				<img
					src={movie.poster_path}
					alt={`${movie.title} poster`}
					className="aspect-2/3 w-full object-cover"
				/>
			</Link>
			<div className="flex flex-col gap-2 min-w-0 flex-1 py-1">
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-col gap-0.5 min-w-0">
						<span className="text-xs font-medium text-muted-foreground tabular-nums">
							Pick {rank}
						</span>
						<Link
							to="/movies/$movieSlug"
							params={{ movieSlug: slug }}
							className="text-base md:text-lg font-semibold leading-tight line-clamp-2 hover:underline underline-offset-4"
						>
							{movie.title}
						</Link>
						<p className="text-sm text-muted-foreground">
							{[
								formatReleaseYear(movie.release_date),
								genres,
								movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : "",
							]
								.filter(Boolean)
								.join(" · ")}
						</p>
					</div>
					<WatchlistStatusButtonView movieId={movie.id} />
				</div>
				<p className="text-sm md:text-base leading-relaxed text-pretty">
					{reason}
				</p>
				{onWatchlist && (
					<Badge variant="outline" className="mt-auto">
						On your watchlist
					</Badge>
				)}
			</div>
		</li>
	);
}
