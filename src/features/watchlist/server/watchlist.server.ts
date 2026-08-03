import { and, desc, eq } from "drizzle-orm";
import { db } from "#/db";
import { movie, watchlist } from "#/db/schema";
import { getMovieDetails } from "#/features/movies/server/movies.functions";

export type WatchlistStatusInsert = typeof watchlist.$inferInsert.status;
export type WatchlistStatus = typeof watchlist.$inferSelect.status;
export type NewMovieInsert = typeof movie.$inferInsert;
export type Movie = typeof movie.$inferInsert;

export async function addToWatchlist(userId: string, movieId: number) {
	return await db
		.insert(watchlist)
		.values({ userId, movieId })
		.onConflictDoNothing()
		.returning();
}

export async function deleteFromWatchlist({
	userId,
	movieId,
}: {
	userId: string;
	movieId: number;
}) {
	const [deleted] = await db
		.delete(watchlist)
		.where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)))
		.returning();

	return deleted ?? null;
}

export async function updateWatchlistStatus({
	userId,
	movieId,
	status,
}: {
	userId: string;
	movieId: number;
	status: WatchlistStatusInsert;
}) {
	const [upserted] = await db
		.insert(watchlist)
		.values({ userId, movieId, status })
		.onConflictDoUpdate({
			target: [watchlist.userId, watchlist.movieId],
			set: { status },
		})
		.returning();

	return upserted ?? null;
}
export async function findOrCreateMovie(movieId: number) {
	const [existingMovie] = await db
		.select()
		.from(movie)
		.where(eq(movie.id, movieId));

	if (existingMovie) return existingMovie;

	const details = await getMovieDetails({ data: { movie_id: movieId } });

	const [insertedMovie] = await db
		.insert(movie)
		.values({
			id: movieId,
			title: details.title,
			posterPath: details.poster_path,
			backdropPath: details.backdrop_path,
			releaseDate: details.release_date,
		})
		.onConflictDoUpdate({
			target: movie.id,
			set: {
				title: details.title,
				posterPath: details.poster_path,
				backdropPath: details.backdrop_path,
				releaseDate: details.release_date,
			},
		})
		.returning();

	return insertedMovie;
}

export async function findMovieByTmdbId(movieId: number) {
	const [existingMovie] = await db
		.select()
		.from(movie)
		.where(eq(movie.id, movieId));

	return existingMovie ?? null;
}

export async function getWatchlistStatus(userId: string, movieId: number) {
	const [existing] = await db
		.select({ status: watchlist.status })
		.from(watchlist)
		.innerJoin(movie, eq(watchlist.movieId, movie.id))
		.where(and(eq(watchlist.userId, userId), eq(movie.id, movieId)));

	return existing?.status ?? null;
}

export async function selectUserWatchlist(userId: string) {
	return await db
		.select()
		.from(watchlist)
		.innerJoin(movie, eq(watchlist.movieId, movie.id))
		.where(eq(watchlist.userId, userId))
		.orderBy(desc(watchlist.addedAt));
}

export async function selectUserWatchlistPage(
	userId: string,
	{ limit, offset }: { limit: number; offset: number },
) {
	return await db
		.select()
		.from(watchlist)
		.innerJoin(movie, eq(watchlist.movieId, movie.id))
		.where(eq(watchlist.userId, userId))
		.orderBy(desc(watchlist.addedAt))
		.limit(limit)
		.offset(offset);
}

export async function selectUserWatchlistStatuses(
	userId: string,
): Promise<Record<number, WatchlistStatus>> {
	const rows = await db
		.select({ id: movie.id, status: watchlist.status })
		.from(watchlist)
		.innerJoin(movie, eq(watchlist.movieId, movie.id))
		.where(eq(watchlist.userId, userId));

	return rows.reduce<Record<number, WatchlistStatus>>((acc, r) => {
		acc[r.id] = r.status;
		return acc;
	}, {});
}
