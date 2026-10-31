import { useQuery } from "@tanstack/react-query";
import { cn } from "#/lib/utils";
import type { GuestMediaInput } from "../guest/guestWatchlist";
import { useUpdateWatchlistStatus } from "../hooks/useUpdateWatchlistStatus";
import { watchlistQueries } from "../queries";
import { AddToWatchlistButton } from "./AddToWatchlistButton";
import { RemoveFromWatchlistButton } from "./RemoveFromWatchlistButton";
import { WatchlistStatusButton } from "./WatchlistStatusButtonView";

type WatchlistStatusButtonViewProps = {
	media: GuestMediaInput;
	className?: string;
};

export function WatchlistStatusButtonView({
	media,
	className,
}: WatchlistStatusButtonViewProps) {
	const { data: status } = useQuery(watchlistQueries.status(media));
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
