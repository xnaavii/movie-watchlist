import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button, ButtonLabel } from "#/components/ui/button";
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
				variant={isWantToWatch ? "contrast" : "secondary"}
				disabled={isPending}
				onClick={() => onSelect("want_to_watch")}
				size={isWantToWatch ? "responsive" : "icon"}
				aria-label={isWantToWatch ? undefined : "Want to watch"}
			>
				<Bookmark data-icon="inline-start" />
				{isWantToWatch && <ButtonLabel>In Your Watchlist</ButtonLabel>}
			</Button>

			<Button
				variant={isWatched ? "default" : "secondary"}
				disabled={isPending}
				onClick={() => onSelect("watched")}
				size={isWatched ? "responsive" : "icon"}
				aria-label={isWatched ? undefined : "Watched"}
			>
				<BookmarkCheck data-icon="inline-start" />
				{isWatched && <ButtonLabel>Watched</ButtonLabel>}
			</Button>
		</div>
	);
}
