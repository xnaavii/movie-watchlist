import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getClientUser, resetClientUser } from "#/lib/clientAuth";
import {
	clearGuestEntries,
	readGuestEntries,
	saveGuestEntry,
} from "./guestWatchlist";

type Session = {
	data: { user: { id: string } } | null;
	isPending: boolean;
	error: Error | null;
};

const mocks = vi.hoisted(() => ({
	session: {
		data: null,
		isPending: true,
		error: null,
	} as Session,
	importFn: vi.fn(),
	clearCachedUserData: vi.fn(),
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("#/lib/auth-client", () => ({
	authClient: { useSession: () => mocks.session },
}));
vi.mock("@tanstack/react-start", () => ({
	useServerFn: (fn: unknown) => fn,
}));
vi.mock("../server/import.functions", () => ({
	IMPORT_BATCH_SIZE: 2,
	importGuestWatchlistFn: mocks.importFn,
}));
vi.mock("../server/watchlist.functions", () => ({}));
vi.mock("#/features/pwa/serviceWorker", () => ({
	clearCachedUserData: mocks.clearCachedUserData,
}));
vi.mock("sonner", () => ({ toast: mocks.toast }));

import { AuthStateSync } from "./AuthStateSync";

const movie = (id: number) => ({
	mediaType: "movie" as const,
	id,
	title: `Movie ${id}`,
});

function setup() {
	const queryClient = new QueryClient();
	const invalidate = vi.spyOn(queryClient, "invalidateQueries");
	const reset = vi.spyOn(queryClient, "resetQueries");
	const view = render(
		<QueryClientProvider client={queryClient}>
			<AuthStateSync />
		</QueryClientProvider>,
	);
	const rerender = () =>
		view.rerender(
			<QueryClientProvider client={queryClient}>
				<AuthStateSync />
			</QueryClientProvider>,
		);
	return { queryClient, invalidate, reset, rerender };
}

const signedIn = (id = "user-1"): Session => ({
	data: { user: { id } },
	isPending: false,
	error: null,
});
const signedOut: Session = { data: null, isPending: false, error: null };

beforeEach(() => {
	resetClientUser();
	clearGuestEntries();
	mocks.session = { data: null, isPending: true, error: null };
	mocks.importFn.mockReset();
	mocks.clearCachedUserData.mockReset();
	mocks.toast.success.mockReset();
	mocks.toast.error.mockReset();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("AuthStateSync", () => {
	it("does nothing while the session check is pending", () => {
		const { invalidate } = setup();
		expect(invalidate).not.toHaveBeenCalled();
		expect(mocks.importFn).not.toHaveBeenCalled();
	});

	it("tells queries a signed-out visitor is a guest and reloads their list", async () => {
		mocks.session = signedOut;
		const { invalidate } = setup();

		await expect(getClientUser()).resolves.toBeNull();
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["watchlist"] });
		// The first check isn't an account change, so cached pages stay.
		expect(mocks.clearCachedUserData).not.toHaveBeenCalled();
	});

	it("records the signed-in user without refetching on the first check", async () => {
		mocks.session = signedIn();
		const { invalidate } = setup();

		await expect(getClientUser()).resolves.toEqual({ id: "user-1" });
		expect(invalidate).not.toHaveBeenCalled();
		expect(mocks.importFn).not.toHaveBeenCalled();
	});

	it("clears cached data and refetches when the account changes", async () => {
		mocks.session = signedIn("user-1");
		const { queryClient, reset, rerender } = setup();
		queryClient.setQueryData(["watchlist", "statuses"], {
			"movie:1": "watched",
		});

		mocks.session = signedIn("user-2");
		rerender();

		expect(mocks.clearCachedUserData).toHaveBeenCalledTimes(1);
		expect(reset).toHaveBeenCalledWith({ queryKey: ["watchlist"] });
		// The first account's list is never shown to the second.
		expect(queryClient.getQueryData(["watchlist", "statuses"])).toBeUndefined();
		await expect(getClientUser()).resolves.toEqual({ id: "user-2" });

		mocks.session = signedOut;
		rerender();
		expect(mocks.clearCachedUserData).toHaveBeenCalledTimes(2);
		await expect(getClientUser()).resolves.toBeNull();
	});

	it("moves guest titles into the account in batches after signing in", async () => {
		saveGuestEntry(movie(1));
		saveGuestEntry(movie(2), "watched");
		saveGuestEntry(movie(3));
		mocks.importFn.mockImplementation(async ({ data }) => ({
			imported: data.length,
			failed: 0,
		}));

		mocks.session = signedOut;
		const { invalidate, rerender } = setup();
		mocks.session = signedIn();
		rerender();

		await waitFor(() => expect(mocks.toast.success).toHaveBeenCalled());
		expect(mocks.toast.success).toHaveBeenCalledWith(
			"Synced 3 titles from this device to your account",
		);
		expect(mocks.importFn).toHaveBeenCalledTimes(2);
		const firstBatch = mocks.importFn.mock.calls[0]?.[0].data;
		// Newest first, as the device list stores them.
		expect(firstBatch).toEqual([
			expect.objectContaining({
				mediaType: "movie",
				id: 3,
				status: "want_to_watch",
			}),
			expect.objectContaining({ mediaType: "movie", id: 2, status: "watched" }),
		]);
		expect(firstBatch[0].watchedAt).toBeNull();
		expect(firstBatch[1].watchedAt).toEqual(expect.any(String));
		expect(mocks.importFn.mock.calls[1]?.[0].data).toEqual([
			expect.objectContaining({ id: 1 }),
		]);
		// Synced titles leave the device, so they aren't imported twice.
		expect(readGuestEntries()).toEqual([]);
		expect(invalidate).toHaveBeenLastCalledWith({ queryKey: ["watchlist"] });
	});

	it("uses the singular when one title syncs", async () => {
		saveGuestEntry(movie(1));
		mocks.importFn.mockResolvedValue({ imported: 1, failed: 0 });
		mocks.session = signedIn();
		setup();

		await waitFor(() =>
			expect(mocks.toast.success).toHaveBeenCalledWith(
				"Synced 1 title from this device to your account",
			),
		);
	});

	it("stays quiet when every title was already in the account", async () => {
		saveGuestEntry(movie(1));
		mocks.importFn.mockResolvedValue({ imported: 0, failed: 0 });
		mocks.session = signedIn();
		setup();

		await waitFor(() => expect(readGuestEntries()).toEqual([]));
		expect(mocks.toast.success).not.toHaveBeenCalled();
		expect(mocks.toast.error).not.toHaveBeenCalled();
	});

	it("keeps unsynced titles on the device when the import fails", async () => {
		saveGuestEntry(movie(1));
		saveGuestEntry(movie(2));
		saveGuestEntry(movie(3));
		mocks.importFn
			.mockResolvedValueOnce({ imported: 2, failed: 0 })
			.mockRejectedValueOnce(new Error("Network down"));
		mocks.session = signedIn();
		setup();

		await waitFor(() => expect(mocks.toast.error).toHaveBeenCalled());
		expect(mocks.toast.success).not.toHaveBeenCalled();
		// The first batch (3 and 2) synced; 1 waits for the next sign-in.
		expect(readGuestEntries().map((entry) => entry.media.id)).toEqual([1]);
	});

	it("doesn't import for a guest", () => {
		saveGuestEntry(movie(1));
		mocks.session = signedOut;
		setup();
		expect(mocks.importFn).not.toHaveBeenCalled();
		expect(readGuestEntries()).toHaveLength(1);
	});

	describe("when the session check fails", () => {
		const failed: Session = {
			data: null,
			isPending: false,
			error: new Error("Failed to fetch"),
		};

		afterEach(() => {
			vi.spyOn(navigator, "onLine", "get").mockRestore();
		});

		it("keeps the user unknown and leaves queries alone online", async () => {
			mocks.session = failed;
			const { invalidate } = setup();
			expect(invalidate).not.toHaveBeenCalled();

			vi.useFakeTimers();
			const user = getClientUser();
			await vi.advanceTimersByTimeAsync(5000);
			await expect(user).resolves.toBeUndefined();
			vi.useRealTimers();
		});

		it("refetches offline so queries fall back to the device list", () => {
			vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
			mocks.session = failed;
			const { invalidate } = setup();
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["watchlist"] });
			expect(mocks.importFn).not.toHaveBeenCalled();
		});
	});
});
