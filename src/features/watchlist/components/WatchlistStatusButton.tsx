import { useQuery } from "@tanstack/react-query";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";
import { useUpdateWatchlistStatus } from "../hooks/useUpdateWatchlistStatus";
import { watchlistQueries } from "../queries";
import { AddToWatchlistButton } from "./AddToWatchlistButton";
import { RemoveFromWatchlistButton } from "./RemoveFromWatchlistButton";
import { WatchlistStatusButton } from "./WatchlistStatusButtonView";

type WatchlistStatusButtonViewProps = {
	movieId: number;
	className?: string;
};

export function WatchlistStatusButtonView({
	movieId,
	className,
}: WatchlistStatusButtonViewProps) {
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
			<WatchlistStatusButton
				status={status}
				isPending={isUpdating}
				onSelect={updateStatus}
			/>
			<RemoveFromWatchlistButton movieId={movieId} />
		</div>
	);
}
