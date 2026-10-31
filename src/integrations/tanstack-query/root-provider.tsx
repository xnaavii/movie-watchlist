import { QueryClient } from "@tanstack/react-query";

export function getContext() {
	const queryClient = new QueryClient({
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
