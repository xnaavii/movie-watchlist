import { BookmarkPlus } from "lucide-react";
import { Button, ButtonLabel } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import type { GuestMediaInput } from "../guest/guestWatchlist";
import { useAddToWatchlist } from "../hooks/useAddToWatchlist";

type AddToWatchlistButtonProps = {
	/** Card data is kept so a guest's list can show it offline. */
	media: GuestMediaInput;
	className?: string;
	/** Shows the text label from md up; below md the button stays icon-only. */
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
			size={showLabel ? "responsive-lg" : "icon"}
			aria-label={showLabel ? undefined : "Add to watchlist"}
		>
			{showLabel && <ButtonLabel>Add to watchlist</ButtonLabel>}
			<BookmarkPlus data-icon="inline-end" />
		</Button>
	);
}
