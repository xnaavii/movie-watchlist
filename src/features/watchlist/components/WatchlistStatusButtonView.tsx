import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import type { WatchlistStatusInsert } from "../server/watchlist.server";

type WatchlistStatusButtonProps = {
	status: WatchlistStatusInsert | null | undefined;
	isPending: boolean;
	onSelect: (status: WatchlistStatusInsert) => void;
	className?: string;
};

export function WatchlistStatusButton({
	status,
	isPending,
	onSelect,
	className,
}: WatchlistStatusButtonProps) {
	const isWatched = status === "watched";
	const isWantToWatch = status === "want_to_watch";

	return (
		<div className={cn("flex gap-2", className)}>
			<Button
				variant={isWantToWatch ? "default" : "secondary"}
				disabled={isPending}
				onClick={() => onSelect("want_to_watch")}
				size={isWantToWatch ? "default" : "icon"}
				title={isWantToWatch ? "Want to watch" : "Watched"}
			>
				<Bookmark />
				{isWantToWatch && "In Your Watchlist"}
			</Button>

			<Button
				variant={isWatched ? "default" : "secondary"}
				disabled={isPending}
				onClick={() => onSelect("watched")}
				size={isWatched ? "default" : "icon"}
			>
				<BookmarkCheck />
				{isWatched && "Watched"}
			</Button>
		</div>
	);
}
