import { queryOptions } from "@tanstack/react-query";
import { getPicks } from "./server/picks.functions";
import type { PickRequest } from "./types";

export const picksQueries = {
	/** `attempt` only changes the cache key, so "Pick again" asks for a fresh answer. */
	picks: (request: PickRequest, attempt = 0) =>
		queryOptions({
			queryKey: ["picks", request, attempt],
			queryFn: () => getPicks({ data: request }),
			// Each run is an AI call, so keep answers for the session.
			staleTime: Number.POSITIVE_INFINITY,
			gcTime: 30 * 60 * 1000,
			retry: false,
		}),
};
