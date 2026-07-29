import { Bookmark } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useAddToWatchlist } from "../hooks/useAddToWatchlist";

type AddToWatchlistButtonProps = {
	tmdbId: number;
	className?: string;
};

export function AddToWatchlistButton({
	tmdbId,
	className,
}: AddToWatchlistButtonProps) {
	const { addToList, isPending } = useAddToWatchlist({ tmdbId });

	return (
		<Button
			disabled={isPending}
			onClick={addToList}
			className={cn(className)}
			size="lg"
		>
			<Bookmark />
			Add to Watchlist
		</Button>
	);
}
