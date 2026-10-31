import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useRevalidateWatchlist } from "./useRevalidateWatchlist";

vi.mock("../server/watchlist.functions", () => ({}));

describe("useRevalidateWatchlist", () => {
	it("invalidates every watchlist query, but nothing else", async () => {
		const queryClient = new QueryClient();
		const keys = [
			["watchlist", "status", "movie", 1],
			["watchlist", "statuses"],
			["watchlist", "list", "infinite", {}],
			["watchlist", "stats"],
			["watchlist", "media", "genre", 28],
			["media", "movie", 1, "details"],
		];
		for (const key of keys) queryClient.setQueryData(key, {});

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useRevalidateWatchlist(), { wrapper });

		await result.current();

		const invalidated = (key: unknown[]) =>
			queryClient.getQueryState(key)?.isInvalidated;
		for (const key of keys.slice(0, -1)) expect(invalidated(key)).toBe(true);
		expect(invalidated(["media", "movie", 1, "details"])).toBe(false);
	});
});
