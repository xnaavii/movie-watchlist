import { BookmarkPlus } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { MediaRef } from "#/features/media/types";
import { cn } from "#/lib/utils";
import { useAddToWatchlist } from "../hooks/useAddToWatchlist";

type AddToWatchlistButtonProps = {
	media: MediaRef;
	className?: string;
	showLabel?: boolean;
};

export function AddToWatchlistButton({
	media,
	className,
	showLabel = false,
}: AddToWatchlistButtonProps) {
	const { addToList, isPending } = useAddToWatchlist({ media });

	return (
		<Button
			disabled={isPending}
			onClick={addToList}
			variant="contrast"
			className={cn(className)}
			size={showLabel ? "lg" : "icon"}
			aria-label={showLabel ? undefined : "Add to watchlist"}
		>
			{showLabel && "Add to watchlist"}
			<BookmarkPlus />
		</Button>
	);
}
