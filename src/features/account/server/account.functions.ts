import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq } from "drizzle-orm";
import { db } from "#/db";
import {
	account,
	atmosVote,
	media,
	session,
	soundRating,
	user,
	watchlist,
} from "#/db/schema";
import { ensureSession } from "#/lib/auth.functions";
import { buildAccountExport } from "../exportData";

/** Everything stored about the signed-in account, for "Download my data". */
export const exportAccountDataFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const { user: current } = await ensureSession();
		const userId = current.id;

		const [profile, accounts, sessions, entries, atmosVotes, soundRatings] =
			await Promise.all([
				db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						emailVerified: user.emailVerified,
						image: user.image,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt,
					})
					.from(user)
					.where(eq(user.id, userId)),
				db
					.select({
						providerId: account.providerId,
						scope: account.scope,
						createdAt: account.createdAt,
					})
					.from(account)
					.where(eq(account.userId, userId)),
				db
					.select({
						createdAt: session.createdAt,
						updatedAt: session.updatedAt,
						expiresAt: session.expiresAt,
						ipAddress: session.ipAddress,
						userAgent: session.userAgent,
					})
					.from(session)
					.where(eq(session.userId, userId)),
				db
					.select({
						tmdbId: watchlist.tmdbId,
						mediaType: watchlist.mediaType,
						title: media.title,
						status: watchlist.status,
						addedAt: watchlist.addedAt,
						watchedAt: watchlist.watchedAt,
					})
					.from(watchlist)
					.leftJoin(
						media,
						and(
							eq(watchlist.tmdbId, media.tmdbId),
							eq(watchlist.mediaType, media.mediaType),
						),
					)
					.where(eq(watchlist.userId, userId))
					.orderBy(asc(watchlist.addedAt)),
				db
					.select({
						tmdbId: atmosVote.tmdbId,
						mediaType: atmosVote.mediaType,
						hasAtmos: atmosVote.hasAtmos,
						updatedAt: atmosVote.updatedAt,
					})
					.from(atmosVote)
					.where(eq(atmosVote.userId, userId)),
				db
					.select({
						tmdbId: soundRating.tmdbId,
						mediaType: soundRating.mediaType,
						overall: soundRating.overall,
						immersion: soundRating.immersion,
						bass: soundRating.bass,
						dialogue: soundRating.dialogue,
						setup: soundRating.setup,
						createdAt: soundRating.createdAt,
						updatedAt: soundRating.updatedAt,
					})
					.from(soundRating)
					.where(eq(soundRating.userId, userId)),
			]);

		const [userRow] = profile;
		if (!userRow) throw new Error("Account not found");

		return buildAccountExport({
			user: userRow,
			accounts,
			sessions,
			watchlist: entries,
			atmosVotes,
			soundRatings,
		});
	},
);
