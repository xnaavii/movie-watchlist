import { Bookmark, Check } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { cn } from "#/lib/utils";
import type { WatchlistStatusInsert } from "../server/watchlist.server";

interface WatchlistBadgeProps {
	status: WatchlistStatusInsert | null;
	className?: string;
}

export function WatchlistBadge({ status, className }: WatchlistBadgeProps) {
	if (!status) return null;

	return (
		<Badge
			variant={status === "watched" ? "default" : "secondary"}
			className={cn("gap-1 w-10 h-10 rounded-full", className)}
			title={status === "watched" ? "Watched" : "Want to watch"}
		>
			{status === "watched" ? (
				<Check className="size-5" />
			) : (
				<Bookmark className="size-5" />
			)}
		</Badge>
	);
}
