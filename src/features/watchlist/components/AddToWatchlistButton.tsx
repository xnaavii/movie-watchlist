import { BookmarkPlus } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useAddToWatchlist } from "../hooks/useAddToWatchlist";

type AddToWatchlistButtonProps = {
	movieId: number;
	className?: string;
	showLabel?: boolean;
};

export function AddToWatchlistButton({
	movieId,
	className,
	showLabel = false,
}: AddToWatchlistButtonProps) {
	const { addToList, isPending } = useAddToWatchlist({ movieId });

	return (
		<Button
			disabled={isPending}
			onClick={addToList}
			className={cn(className)}
			size={showLabel ? "lg" : "icon"}
			aria-label={showLabel ? undefined : "Add to watchlist"}
		>
			{showLabel && "Add to watchlist"}
			<BookmarkPlus />
		</Button>
	);
}
