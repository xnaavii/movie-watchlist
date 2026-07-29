import { Bookmark, Check } from "lucide-react";
import { cn } from "#/lib/utils";
import type { WatchlistStatusInsert } from "../server/watchlist.server";

interface WatchlistBadgeProps {
	status: WatchlistStatusInsert | null;
	className?: string;
}

export function WatchlistBadge({ status, className }: WatchlistBadgeProps) {
	if (!status) return null;

	return (
		<div
			className={cn(
				"flex items-center justify-center gap-1 w-10 h-10 lg:w-12 lg:h-12 rounded-full",
				status === "watched" ? "bg-primary" : "bg-secondary",
				className,
			)}
			title={status === "watched" ? "Watched" : "Want to watch"}
		>
			{status === "watched" ? (
				<Check className="size-4 lg:size-5" />
			) : (
				<Bookmark className="size-4 lg:size-5" />
			)}
		</div>
	);
}
