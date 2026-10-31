import { createServerFn } from "@tanstack/react-start";
import { MEDIA_TYPES, type MediaRef } from "#/features/media/types";
import { ensureSession } from "#/lib/auth.functions";
import { importWatchlistEntries } from "./watchlist.server";

/**
 * Titles per request. Each new title can cost a TMDB call, so batches stay
 * well under the Workers subrequest limit.
 */
export const IMPORT_BATCH_SIZE = 10;

export type ImportEntry = MediaRef & {
	status: "want_to_watch" | "watched";
	addedAt: string;
	watchedAt: string | null;
};

function parseEntries(data: unknown): ImportEntry[] {
	if (!Array.isArray(data)) throw new Error("Expected a list of titles");
	return data.slice(0, IMPORT_BATCH_SIZE).map((entry) => {
		const { mediaType, id, status, addedAt, watchedAt } = entry ?? {};
		if (!MEDIA_TYPES.includes(mediaType) || !Number.isInteger(id)) {
			throw new Error("Invalid title");
		}
		return {
			mediaType,
			id,
			status: status === "watched" ? "watched" : "want_to_watch",
			addedAt: typeof addedAt === "string" ? addedAt : new Date().toISOString(),
			watchedAt: typeof watchedAt === "string" ? watchedAt : null,
		};
	});
}

/**
 * Moves titles saved on a device before signing in into the account. Titles
 * already in the account keep their status.
 */
export const importGuestWatchlistFn = createServerFn({ method: "POST" })
	.validator(parseEntries)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		return await importWatchlistEntries(session.user.id, data);
	});
