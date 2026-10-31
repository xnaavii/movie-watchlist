import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { clearCachedUserData } from "#/features/pwa/serviceWorker";
import { authClient } from "#/lib/auth-client";
import { setClientUser } from "#/lib/clientAuth";
import { watchlistQueries } from "../queries";
import {
	IMPORT_BATCH_SIZE,
	importGuestWatchlistFn,
} from "../server/import.functions";
import { readGuestEntries, removeGuestEntry } from "./guestWatchlist";

let importing = false;

/**
 * Tells watchlist queries whether someone is signed in, refreshes them when
 * that changes, and moves a guest's saved titles into the account after
 * signing in. Renders nothing.
 */
export function AuthStateSync() {
	const { data: session, isPending, error } = authClient.useSession();
	const queryClient = useQueryClient();
	const importGuestWatchlist = useServerFn(importGuestWatchlistFn);
	const userId = session?.user.id ?? null;
	const lastUserId = useRef<string | null | undefined>(undefined);

	useEffect(() => {
		if (isPending) return;
		// A failed check (e.g. offline) says nothing about who is signed in.
		// Offline, refetch anyway: queries then fall back to the device list
		// instead of the empty one the cached page was rendered with.
		if (error) {
			if (!navigator.onLine) {
				queryClient.invalidateQueries({ queryKey: watchlistQueries.allKey });
			}
			return;
		}
		setClientUser(userId ? { id: userId } : null);

		const changed =
			lastUserId.current !== undefined && lastUserId.current !== userId;
		const firstCheck = lastUserId.current === undefined;
		lastUserId.current = userId;

		// The server rendered the page without the guest list, so a signed-out
		// browser reloads it from this device on the first check too.
		// A different person now: drop the last one's watchlist rather than
		// showing it while the new one loads (resetQueries, not invalidate).
		if (changed) {
			clearCachedUserData();
			queryClient.resetQueries({ queryKey: watchlistQueries.allKey });
		} else if (firstCheck && !userId) {
			queryClient.invalidateQueries({ queryKey: watchlistQueries.allKey });
		}

		if (!userId || importing) return;
		const entries = readGuestEntries();
		if (entries.length === 0) return;

		importing = true;
		(async () => {
			let imported = 0;
			try {
				for (let i = 0; i < entries.length; i += IMPORT_BATCH_SIZE) {
					const batch = entries.slice(i, i + IMPORT_BATCH_SIZE);
					const result = await importGuestWatchlist({
						data: batch.map(({ media, status, addedAt, watchedAt }) => ({
							mediaType: media.mediaType,
							id: media.id,
							status,
							addedAt,
							watchedAt,
						})),
					});
					imported += result.imported;
					for (const { media } of batch) removeGuestEntry(media);
				}
				if (imported > 0) {
					toast.success(
						`Synced ${imported} ${imported === 1 ? "title" : "titles"} from this device to your account`,
					);
				}
			} catch {
				toast.error(
					"Couldn't sync the titles saved on this device. We'll try again next time.",
				);
			} finally {
				importing = false;
				queryClient.invalidateQueries({ queryKey: watchlistQueries.allKey });
			}
		})();
	}, [isPending, error, userId, queryClient, importGuestWatchlist]);

	return null;
}
