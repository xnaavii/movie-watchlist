// RemoveFromWatchlistButton.tsx
import { BookmarkMinus } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useRemoveFromWatchlist } from "../hooks/useRemoveFromWatchlist";

type RemoveFromWatchlistButtonProps = {
	movieId: number;
	className?: string;
};

export function RemoveFromWatchlistButton({
	movieId,
	className,
}: RemoveFromWatchlistButtonProps) {
	const { remove, isPending } = useRemoveFromWatchlist({ movieId });

	return (
		<Button
			size="icon"
			variant="destructive"
			disabled={isPending}
			onClick={() => remove()}
			aria-label="Remove from watchlist"
			className={cn(className)}
		>
			<BookmarkMinus />
		</Button>
	);
}
