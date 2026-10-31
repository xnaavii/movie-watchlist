import { toast } from "sonner";
import { readGuestEntries } from "./guestWatchlist";

/**
 * Confirms a guest save. The first save also explains where it lives and how
 * an account syncs it across devices.
 */
export function toastGuestSave(message: string, navigateToSignup: () => void) {
	if (readGuestEntries().length === 1) {
		toast.success(message, {
			description:
				"It's saved on this device. Create a free account to sync your watchlist across devices.",
			duration: 8000,
			action: { label: "Sign up", onClick: navigateToSignup },
		});
		return;
	}
	toast.success(message);
}
