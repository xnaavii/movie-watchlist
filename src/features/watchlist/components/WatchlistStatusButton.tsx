import { useQuery } from "@tanstack/react-query";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";
import { useUpdateWatchlistStatus } from "../hooks/useUpdateWatchlistStatus";
import { watchlistQueries } from "../queries";
import { AddToWatchlistButton } from "./AddToWatchlistButton";
import { RemoveFromWatchlistButton } from "./RemoveFromWatchlistButton";
import { WatchlistStatusButtonView } from "./WatchlistStatusButtonView";

type WatchlistStatusButtonProps = {
	tmdbId: number;
	className?: string;
};

export function WatchlistStatusButton({
	tmdbId,
	className,
}: WatchlistStatusButtonProps) {
	const { data: session } = authClient.useSession();
	const { data: status } = useQuery({
		...watchlistQueries.status(tmdbId),
		enabled: !!session,
	});
	const { updateStatus, isPending: isUpdating } = useUpdateWatchlistStatus({
		tmdbId,
	});

	if (status == null) {
		return <AddToWatchlistButton tmdbId={tmdbId} className={className} />;
	}

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<WatchlistStatusButtonView
				status={status}
				isPending={isUpdating}
				onSelect={updateStatus}
			/>
			<RemoveFromWatchlistButton tmdbId={tmdbId} />
		</div>
	);
}
