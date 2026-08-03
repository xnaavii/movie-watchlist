import { Link } from "@tanstack/react-router";
import { Bookmark, Check } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Badge } from "#/components/ui/badge";
import type {
	Movie,
	WatchlistStatus,
} from "#/features/watchlist/server/watchlist.server";
import { cn } from "#/lib/utils";
import { formatReleaseYear } from "../utils";

type MovieCardProps = {
	movie: Movie;
	variant?: "poster" | "backdrop";
	className?: string;
	watchlistStatus?: WatchlistStatus;
};

export function MovieCard({
	movie,
	className,
	variant = "poster",
	watchlistStatus,
}: MovieCardProps) {
	const isBackdrop = variant === "backdrop";
	const imageSrc = isBackdrop ? movie.backdropPath : movie.posterPath;
	const aspectRatio = isBackdrop ? 16 / 9 : 2 / 3;

	return (
		<div className="flex flex-col gap-2 w-full">
			<div
				className={cn(
					"relative mx-auto w-full group rounded-3xl overflow-hidden shrink-0",
					className,
				)}
				title={movie.title}
			>
				{watchlistStatus && (
					<div className="absolute top-3 right-3 z-20">
						<WatchlistBadge status={watchlistStatus} />
					</div>
				)}
				<Link
					to="/movies/$id"
					params={{ id: `${movie.id}` }}
					className="block size-full focus:outline-none"
				>
					<AspectRatio ratio={aspectRatio}>
						{imageSrc ? (
							<img
								src={imageSrc}
								alt={movie.title}
								className={cn(
									"size-full object-cover transition-all duration-200 group-hover:scale-105",
									watchlistStatus === "want_to_watch" ? "saturate-0" : "",
								)}
								loading="eager"
							/>
						) : (
							<div className="bg-muted size-full flex items-center justify-center text-xs text-muted-foreground">
								No image
							</div>
						)}
					</AspectRatio>
				</Link>

				{variant === "poster" && (
					<div className="rounded-xl absolute inset-0 flex-col justify-end gap-1 p-4 size-full hidden group-hover:flex group-focus-within:flex bg-background/80 transition-discrete pointer-events-none">
						<h4 className="text-sm font-semibold line-clamp-1">
							{movie.title}
						</h4>
						<p className="text-xs text-muted-foreground">
							{formatReleaseYear(movie.releaseDate)}
						</p>
					</div>
				)}
				<div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] inset-ring-2 inset-ring-muted transition-all duration-200 group-hover:inset-ring-foreground group-has-focus-visible:inset-ring-foreground" />
			</div>

			{variant === "backdrop" && (
				<div className="flex flex-col gap-0.5 px-1">
					<h4 className="text-sm md:text-base font-semibold line-clamp-1">
						{movie.title}
					</h4>
					<p className="text-xs md:text-sm text-muted-foreground">
						{formatReleaseYear(movie.releaseDate)}
					</p>
				</div>
			)}
		</div>
	);
}

function WatchlistBadge({ status }: { status: WatchlistStatus }) {
	return (
		<Badge
			variant={status === "watched" ? "default" : "secondary"}
			className="gap-1 rounded-full w-8 h-8"
			title={status === "watched" ? "Watched" : "Want to watch"}
		>
			{status === "watched" ? <Check /> : <Bookmark />}
		</Badge>
	);
}
