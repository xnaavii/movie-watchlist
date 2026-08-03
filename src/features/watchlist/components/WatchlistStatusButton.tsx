import { useQuery } from "@tanstack/react-query";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";
import { useUpdateWatchlistStatus } from "../hooks/useUpdateWatchlistStatus";
import { watchlistQueries } from "../queries";
import { AddToWatchlistButton } from "./AddToWatchlistButton";
import { RemoveFromWatchlistButton } from "./RemoveFromWatchlistButton";
import { WatchlistStatusButtonView } from "./WatchlistStatusButtonView";

type WatchlistStatusButtonProps = {
	movieId: number;
	className?: string;
};

export function WatchlistStatusButton({
	movieId,
	className,
}: WatchlistStatusButtonProps) {
	const { data: session } = authClient.useSession();
	const { data: status } = useQuery({
		...watchlistQueries.status(movieId),
		enabled: !!session,
	});
	const { updateStatus, isPending: isUpdating } = useUpdateWatchlistStatus({
		movieId,
	});

	if (status == null) {
		return <AddToWatchlistButton movieId={movieId} className={className} />;
	}

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<WatchlistStatusButtonView
				status={status}
				isPending={isUpdating}
				onSelect={updateStatus}
				className="flex-1"
			/>
			<RemoveFromWatchlistButton movieId={movieId} />
		</div>
	);
}
