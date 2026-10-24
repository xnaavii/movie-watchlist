import { useQuery } from "@tanstack/react-query";
import type { MediaRef } from "#/features/media/types";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";
import { useUpdateWatchlistStatus } from "../hooks/useUpdateWatchlistStatus";
import { watchlistQueries } from "../queries";
import { AddToWatchlistButton } from "./AddToWatchlistButton";
import { RemoveFromWatchlistButton } from "./RemoveFromWatchlistButton";
import { WatchlistStatusButton } from "./WatchlistStatusButtonView";

type WatchlistStatusButtonViewProps = {
	media: MediaRef;
	className?: string;
};

export function WatchlistStatusButtonView({
	media,
	className,
}: WatchlistStatusButtonViewProps) {
	const { data: session } = authClient.useSession();
	const { data: status } = useQuery({
		...watchlistQueries.status(media),
		enabled: !!session,
	});
	const { updateStatus, isPending: isUpdating } = useUpdateWatchlistStatus({
		media,
	});

	if (status == null) {
		return <AddToWatchlistButton media={media} className={className} />;
	}

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<WatchlistStatusButton
				status={status}
				isPending={isUpdating}
				onSelect={updateStatus}
			/>
			<RemoveFromWatchlistButton media={media} />
		</div>
	);
}
