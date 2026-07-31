import { Link } from "@tanstack/react-router";
import { Bookmark, Check } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Badge } from "#/components/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { cn } from "#/lib/utils";
import { formatReleaseYear } from "../utils";

type MovieCardProps = {
	id: number | string;
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	className?: string;
	watchlistStatus?: WatchlistStatus;
};

export function MovieCard({
	id,
	title,
	posterPath,
	releaseDate,
	className,
	watchlistStatus,
}: MovieCardProps) {
	return (
		<Card
			className={cn("relative mx-auto w-full py-0 group", className)}
			title={title}
		>
			{watchlistStatus && (
				<div className="absolute top-2 right-2 z-20">
					<WatchlistBadge status={watchlistStatus} />
				</div>
			)}
			<Link
				to="/movies/$id"
				params={{ id: `${id}` }}
				className="block size-full focus:outline-none"
			>
				<AspectRatio ratio={2 / 3}>
					{posterPath ? (
						<img
							src={posterPath}
							alt={title}
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
			<CardHeader className="rounded-xl absolute inset-0 flex-col justify-end gap-2 p-4 size-full hidden group-hover:flex group-focus-within:flex bg-background/80 transition-discrete pointer-events-none">
				<CardTitle className="text-sm md:text-base">{title}</CardTitle>
				<CardDescription>{formatReleaseYear(releaseDate)}</CardDescription>
			</CardHeader>
			<div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] inset-ring-2 inset-ring-muted transition-all duration-200 group-hover:inset-ring-foreground group-has-focus-visible:inset-ring-foreground" />
		</Card>
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
