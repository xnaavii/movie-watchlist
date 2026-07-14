import { ListCheck, ListPlus } from "lucide-react";
import { Button } from "#/components/ui/button";

interface WatchlistToggleButtonProps {
	isInWatchlist?: boolean;
	onToggle: () => void;
}

export function WatchlistToggleButton({
	isInWatchlist,
	onToggle,
}: WatchlistToggleButtonProps) {
	return (
		<Button
			onClick={onToggle}
			variant={isInWatchlist ? "outline" : "default"}
		>
			{isInWatchlist ? <ListCheck /> : <ListPlus />}
			{isInWatchlist ? "In watchlist" : "Add to watchlist"}
		</Button>
	);
}
