import { Bookmark, Check, Eye } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import type { WatchlistStatusInsert } from "../server/watchlist.server";

type WatchlistStatusButtonViewProps = {
	status: WatchlistStatusInsert | null | undefined;
	isPending: boolean;
	onSelect: (status: WatchlistStatusInsert) => void;
	className?: string;
};

export function WatchlistStatusButtonView({
	status,
	isPending,
	onSelect,
	className,
}: WatchlistStatusButtonViewProps) {
	const isWatched = status === "watched";
	const isWantToWatch = status === "want_to_watch";

	return (
		<div className={cn("flex gap-2", className)}>
			<Button
				variant={isWantToWatch ? "default" : "outline"}
				disabled={isPending}
				onClick={() => onSelect("want_to_watch")}
			>
				{isWantToWatch ? <Check /> : <Bookmark />}
				Want to Watch
			</Button>

			<Button
				variant={isWatched ? "default" : "outline"}
				disabled={isPending}
				onClick={() => onSelect("watched")}
			>
				{isWatched ? <Check /> : <Eye />}
				Watched
			</Button>
		</div>
	);
}
