import { and, eq } from "drizzle-orm";
import { db } from "#/db";
import { movie, watchlist } from "#/db/schema";

export type WatchlistStatusInsert = typeof watchlist.$inferInsert.status;
export type NewMovieInsert = typeof movie.$inferInsert;

export async function insertIntoWatchlist(
	userId: string,
	status: WatchlistStatusInsert,
	movieId: string,
) {
	return await db
		.insert(watchlist)
		.values({ userId, movieId, status })
		.onConflictDoNothing()
		.returning();
}

export async function findOrCreateMovie(newMovie: NewMovieInsert) {
	const [existingMovie] = await db
		.select()
		.from(movie)
		.where(eq(movie.tmdbId, newMovie.tmdbId));

	if (existingMovie) {
		return existingMovie;
	}

	const [insertedMovie] = await db.insert(movie).values(newMovie).returning();
	return insertedMovie;
}

export async function getWatchlistStatus(userId: string, tmdbId: number) {
	const [existing] = await db
		.select({ id: watchlist.id })
		.from(watchlist)
		.innerJoin(movie, eq(watchlist.movieId, movie.id))
		.where(and(eq(watchlist.userId, userId), eq(movie.tmdbId, tmdbId)));

	return Boolean(existing);
}
