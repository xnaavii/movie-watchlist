import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mediaRefSchema } from "#/features/media/schemas";
import { WATCHLIST_STATUSES } from "#/features/media/utils/filters";
import { ensureSession } from "#/lib/auth.functions";
import { importWatchlistEntries } from "./watchlist.server";

/**
 * Titles per request. Each new title can cost a TMDB call, so batches stay
 * well under the Workers subrequest limit.
 */
export const IMPORT_BATCH_SIZE = 10;

const importEntrySchema = mediaRefSchema.extend({
	status: z.enum(WATCHLIST_STATUSES).catch("want_to_watch"),
	addedAt: z.string().catch(() => new Date().toISOString()),
	watchedAt: z.string().nullable().catch(null),
});

export type ImportEntry = z.infer<typeof importEntrySchema>;

/** One batch of guest titles. Bad statuses and dates fall back to defaults. */
export const importEntriesSchema = z
	.array(importEntrySchema)
	.transform((entries) => entries.slice(0, IMPORT_BATCH_SIZE));

export const parseEntries = (data: unknown) => importEntriesSchema.parse(data);

/**
 * Moves titles saved on a device before signing in into the account. Titles
 * already in the account keep their status.
 */
export const importGuestWatchlistFn = createServerFn({ method: "POST" })
	.validator(importEntriesSchema)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		return await importWatchlistEntries(session.user.id, data);
	});
