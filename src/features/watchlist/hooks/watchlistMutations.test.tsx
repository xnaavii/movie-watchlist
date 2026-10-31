import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetClientUser, setClientUser } from "#/lib/clientAuth";
import {
	clearGuestEntries,
	getGuestStatus,
	readGuestEntries,
	saveGuestEntry,
} from "../guest/guestWatchlist";

const mocks = vi.hoisted(() => ({
	addToWatchlistFn: vi.fn(),
	updateWatchlistStatusFn: vi.fn(),
	removeFromWatchlist: vi.fn(),
	navigate: vi.fn(),
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../server/watchlist.functions", () => ({
	addToWatchlistFn: mocks.addToWatchlistFn,
	updateWatchlistStatusFn: mocks.updateWatchlistStatusFn,
	removeFromWatchlist: mocks.removeFromWatchlist,
}));
vi.mock("@tanstack/react-start", () => ({
	useServerFn: (fn: unknown) => fn,
}));
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mocks.navigate,
}));
vi.mock("sonner", () => ({ toast: mocks.toast }));

import { getContext } from "#/integrations/tanstack-query/root-provider";
import { useAddToWatchlist } from "./useAddToWatchlist";
import { useRemoveFromWatchlist } from "./useRemoveFromWatchlist";
import { useUpdateWatchlistStatus } from "./useUpdateWatchlistStatus";

const show = {
	mediaType: "tv" as const,
	id: 95396,
	title: "Severance",
	posterPath: "/severance.jpg",
};
const ref = { mediaType: "tv" as const, id: 95396 };

let queryClient: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

beforeEach(() => {
	// The app's own client, so failed saves toast through its mutation cache.
	queryClient = getContext().queryClient;
	resetClientUser();
	clearGuestEntries();
	for (const fn of [
		mocks.addToWatchlistFn,
		mocks.updateWatchlistStatusFn,
		mocks.removeFromWatchlist,
		mocks.navigate,
		mocks.toast.success,
		mocks.toast.error,
	]) {
		fn.mockReset();
	}
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("watchlist changes for a guest", () => {
	beforeEach(() => setClientUser(null));

	it("saves to this device and explains sync on the first save", async () => {
		const invalidate = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHook(() => useAddToWatchlist({ media: show }), {
			wrapper,
		});

		act(() => result.current.addToList());

		await waitFor(() => expect(mocks.toast.success).toHaveBeenCalled());
		expect(getGuestStatus(ref)).toBe("want_to_watch");
		expect(readGuestEntries()[0]?.media.title).toBe("Severance");
		expect(mocks.addToWatchlistFn).not.toHaveBeenCalled();
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["watchlist"] });

		const [message, options] = mocks.toast.success.mock.calls[0] ?? [];
		expect(message).toBe("Added to watchlist");
		expect(options.description).toMatch(/saved on this device/);
		options.action.onClick();
		expect(mocks.navigate).toHaveBeenCalledWith({ to: "/auth/signup" });
	});

	it("keeps later save toasts short", async () => {
		saveGuestEntry({ mediaType: "movie", id: 1 });
		const { result } = renderHook(() => useAddToWatchlist({ media: show }), {
			wrapper,
		});

		act(() => result.current.addToList());

		await waitFor(() =>
			expect(mocks.toast.success).toHaveBeenCalledWith("Added to watchlist"),
		);
	});

	it("marks a title as watched on this device", async () => {
		const { result } = renderHook(
			() => useUpdateWatchlistStatus({ media: show }),
			{ wrapper },
		);

		act(() => result.current.updateStatus("watched"));

		await waitFor(() => expect(mocks.toast.success).toHaveBeenCalled());
		expect(mocks.toast.success.mock.calls[0]?.[0]).toBe("Marked as watched");
		expect(getGuestStatus(ref)).toBe("watched");
		expect(readGuestEntries()[0]?.watchedAt).toEqual(expect.any(String));
		expect(mocks.updateWatchlistStatusFn).not.toHaveBeenCalled();
	});

	it("removes a title from this device", async () => {
		saveGuestEntry(show);
		const { result } = renderHook(
			() => useRemoveFromWatchlist({ media: show }),
			{ wrapper },
		);

		act(() => result.current.remove());

		await waitFor(() =>
			expect(mocks.toast.success).toHaveBeenCalledWith(
				"Removed from watchlist",
			),
		);
		expect(getGuestStatus(ref)).toBeNull();
		expect(mocks.removeFromWatchlist).not.toHaveBeenCalled();
	});

	it("works offline, since nothing needs the server", async () => {
		vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
		const { result } = renderHook(() => useAddToWatchlist({ media: show }), {
			wrapper,
		});

		act(() => result.current.addToList());

		await waitFor(() => expect(mocks.toast.success).toHaveBeenCalled());
		expect(getGuestStatus(ref)).toBe("want_to_watch");
	});
});

describe("watchlist changes for a signed-in user", () => {
	beforeEach(() => setClientUser({ id: "user-1" }));

	it("saves to the account, not the device", async () => {
		mocks.addToWatchlistFn.mockResolvedValue(undefined);
		const { result } = renderHook(() => useAddToWatchlist({ media: show }), {
			wrapper,
		});

		act(() => result.current.addToList());

		await waitFor(() =>
			expect(mocks.toast.success).toHaveBeenCalledWith("Added to watchlist"),
		);
		expect(mocks.addToWatchlistFn).toHaveBeenCalledWith({ data: ref });
		expect(readGuestEntries()).toEqual([]);
	});

	it("updates the status on the account", async () => {
		mocks.updateWatchlistStatusFn.mockResolvedValue(undefined);
		const { result } = renderHook(
			() => useUpdateWatchlistStatus({ media: show }),
			{ wrapper },
		);

		act(() => result.current.updateStatus("want_to_watch"));

		await waitFor(() =>
			expect(mocks.toast.success).toHaveBeenCalledWith(
				"Marked as want to watch",
			),
		);
		expect(mocks.updateWatchlistStatusFn).toHaveBeenCalledWith({
			data: { ...ref, status: "want_to_watch" },
		});
	});

	it("removes from the account", async () => {
		mocks.removeFromWatchlist.mockResolvedValue(undefined);
		const { result } = renderHook(
			() => useRemoveFromWatchlist({ media: show }),
			{ wrapper },
		);

		act(() => result.current.remove());

		await waitFor(() => expect(mocks.toast.success).toHaveBeenCalled());
		expect(mocks.removeFromWatchlist).toHaveBeenCalledWith({ data: ref });
	});

	it("refuses account changes offline with a clear message", async () => {
		vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
		const { result } = renderHook(() => useAddToWatchlist({ media: show }), {
			wrapper,
		});

		act(() => result.current.addToList());

		await waitFor(() =>
			expect(mocks.toast.error).toHaveBeenCalledWith(
				"You're offline. Connect to save changes to your account.",
			),
		);
		expect(mocks.addToWatchlistFn).not.toHaveBeenCalled();
		expect(readGuestEntries()).toEqual([]);
	});

	it("shows the server's error message", async () => {
		mocks.removeFromWatchlist.mockRejectedValue(new Error("Unauthorized"));
		const { result } = renderHook(
			() => useRemoveFromWatchlist({ media: show }),
			{ wrapper },
		);

		act(() => result.current.remove());

		await waitFor(() =>
			expect(mocks.toast.error).toHaveBeenCalledWith("Unauthorized"),
		);
	});
});
