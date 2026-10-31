import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function getContext() {
	const queryClient = new QueryClient({
		// One place for failed saves: every mutation shows its error as a toast,
		// so mutation hooks don't each repeat an onError.
		mutationCache: new MutationCache({
			onError: (error) => {
				toast.error(
					error instanceof Error
						? error.message
						: "Something went wrong. Please try again.",
				);
			},
		}),
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
			},
		},
	});

	// TMDB data changes slowly and is cached on the server too, so revisits in
	// the same session reuse it instead of asking the Worker again.
	queryClient.setQueryDefaults(["media"], { staleTime: 1000 * 60 * 60 });

	return {
		queryClient,
	};
}
