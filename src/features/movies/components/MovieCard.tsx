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
import type { WatchlistStatusInsert } from "#/features/watchlist/server/watchlist.server";
import { cn } from "#/lib/utils";
import { formatReleaseYear } from "../utils";

type MovieCardProps = {
	id: number | string;
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	className?: string;
	watchlistStatus?: WatchlistStatusInsert;
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
				<div className="absolute top-2 right-2 z-10">
					<WatchlistBadge status={watchlistStatus} />
				</div>
			)}
			<Link
				to="/movies/$id"
				params={{ id: `${id}` }}
				className="block size-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<AspectRatio ratio={2 / 3}>
					{posterPath ? (
						<img
							src={posterPath}
							alt={title}
							className={cn(
								"size-full object-cover",
								watchlistStatus === "want_to_watch" ? "saturate-0" : "",
							)}
							loading="lazy"
						/>
					) : (
						<div className="bg-muted size-full flex items-center justify-center text-xs text-muted-foreground">
							No image
						</div>
					)}
				</AspectRatio>
			</Link>
			<CardHeader className="absolute inset-0 flex-col gap-2 p-4 size-full hidden group-hover:flex group-focus-within:flex bg-background/80 transition-discrete pointer-events-none">
				<CardTitle>{title}</CardTitle>
				<CardDescription>{formatReleaseYear(releaseDate)}</CardDescription>
			</CardHeader>
		</Card>
	);
}

function WatchlistBadge({ status }: { status: WatchlistStatusInsert }) {
	return (
		<Badge
			variant={status === "watched" ? "default" : "secondary"}
			className="gap-1"
			title={status === "watched" ? "Watched" : "Want to watch"}
		>
			{status === "watched" ? (
				<Check className="size-3" />
			) : (
				<Bookmark className="size-3" />
			)}
		</Badge>
	);
}
