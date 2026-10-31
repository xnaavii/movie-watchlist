import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "./useOnlineStatus";

/** A quiet pill while offline, so stale or missing sections make sense. */
export function OfflineBanner() {
	const online = useOnlineStatus();
	if (online) return null;

	return (
		<div
			role="status"
			className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none"
		>
			<p className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
				<WifiOff className="size-4" aria-hidden="true" />
				You're offline. Showing what's saved on this device.
			</p>
		</div>
	);
}
