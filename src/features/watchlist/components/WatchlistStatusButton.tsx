import { useQuery } from "@tanstack/react-query";
import { authClient } from "#/lib/auth-client";
import { useUpdateWatchlistStatus } from "../hooks/useUpdateWatchlistStatus";
import { watchlistQueries } from "../queries";
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
	const { updateStatus, isPending } = useUpdateWatchlistStatus({ tmdbId });

	return (
		<WatchlistStatusButtonView
			status={status}
			isPending={isPending}
			onSelect={updateStatus}
			className={className}
		/>
	);
}
