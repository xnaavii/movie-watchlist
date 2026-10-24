// RemoveFromWatchlistButton.tsx

import { BookmarkMinus } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { MediaRef } from "#/features/media/types";
import { cn } from "#/lib/utils";
import { useRemoveFromWatchlist } from "../hooks/useRemoveFromWatchlist";

type RemoveFromWatchlistButtonProps = {
	media: MediaRef;
	className?: string;
};

export function RemoveFromWatchlistButton({
	media,
	className,
}: RemoveFromWatchlistButtonProps) {
	const { remove, isPending } = useRemoveFromWatchlist({ media });

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
