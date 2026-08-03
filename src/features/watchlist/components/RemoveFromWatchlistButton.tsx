// RemoveFromWatchlistButton.tsx
import { X } from "lucide-react";
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
			size="icon-lg"
			variant="ghost"
			disabled={isPending}
			onClick={() => remove()}
			aria-label="Remove from watchlist"
			className={cn(className)}
		>
			<X />
		</Button>
	);
}
