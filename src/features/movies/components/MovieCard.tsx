import { Link } from "@tanstack/react-router";
import { Bookmark, Check } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Badge } from "#/components/ui/badge";
import { Card } from "#/components/ui/card";
import type { WatchlistStatusInsert } from "#/features/watchlist/server/watchlist.server";
import { cn } from "#/lib/utils";

type MovieCardProps = {
	id: number | string;
	title: string;
	posterPath: string | null;
	className?: string;
	watchlistStatus?: "want_to_watch" | "watched" | null;
};

export function MovieCard({
	id,
	title,
	posterPath,
	className,
	watchlistStatus,
}: MovieCardProps) {
	return (
		<Card
			className={cn("relative mx-auto w-full py-0", className)}
			title={title}
		>
			{watchlistStatus && (
				<div className="absolute top-2 right-2 z-10">
					<WatchlistBadge status={watchlistStatus} />
				</div>
			)}
			<AspectRatio ratio={2 / 3}>
				<Link
					to="/movies/$id"
					params={{ id: `${id}` }}
					className="block size-full"
				>
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
				</Link>
			</AspectRatio>
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
