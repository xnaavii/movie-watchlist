// RemoveFromWatchlistButton.tsx
import { X } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useRemoveFromWatchlist } from "../hooks/useRemoveFromWatchlist";

type RemoveFromWatchlistButtonProps = {
	tmdbId: number;
	className?: string;
};

export function RemoveFromWatchlistButton({
	tmdbId,
	className,
}: RemoveFromWatchlistButtonProps) {
	const { remove, isPending } = useRemoveFromWatchlist({ tmdbId });

	return (
		<Button
			size="icon"
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
