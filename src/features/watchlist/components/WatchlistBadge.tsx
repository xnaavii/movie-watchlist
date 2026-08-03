import { Bookmark, Check } from "lucide-react";
import { cn } from "#/lib/utils";
import type { WatchlistStatus } from "../server/watchlist.server";

interface WatchlistBadgeProps {
	status: WatchlistStatus;
	className?: string;
}

export function WatchlistBadge({ status, className }: WatchlistBadgeProps) {
	if (!status) return null;

	return (
		<div
			className={cn(
				"gap-1 rounded-full bg-secondary p-2 flex items-center justify-center w-fit h-fit border",
				status === "watched" ? "bg-primary" : "bg-secondary",
				className,
			)}
			title={status === "watched" ? "Watched" : "In the Watchlist"}
		>
			{status === "watched" ? (
				<Check className="size-3 lg:size-4" />
			) : (
				<Bookmark className="size-3 lg:size-4" />
			)}
		</div>
	);
}
