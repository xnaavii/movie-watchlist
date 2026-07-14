import { and, eq } from "drizzle-orm";
import { db } from "#/db";
import { movie, watchlist } from "#/db/schema";
import { getMovieDetails } from "#/features/movies/server/movies.functions";

export type WatchlistStatusInsert = typeof watchlist.$inferInsert.status;
export type NewMovieInsert = typeof movie.$inferInsert;

export async function insertIntoWatchlist({
	userId,
	movieId,
	status,
}: {
	userId: string;
	movieId: string;
	status: WatchlistStatusInsert;
}) {
	return await db
		.insert(watchlist)
		.values({ userId, movieId, status })
		.onConflictDoNothing()
		.returning();
}

export async function deleteFromWatchlist({
	userId,
	movieId,
}: {
	userId: string;
	movieId: string;
}) {
	const [deleted] = await db
		.delete(watchlist)
		.where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)))
		.returning();

	return deleted ?? null;
}

export async function findOrCreateMovie(tmdbId: number) {
	const [existingMovie] = await db
		.select()
		.from(movie)
		.where(eq(movie.tmdbId, tmdbId));

	if (existingMovie) return existingMovie;

	const details = await getMovieDetails({ data: { movie_id: tmdbId } });

	const [insertedMovie] = await db
		.insert(movie)
		.values({
			tmdbId,
			title: details.title,
			posterPath: details.poster_path,
			releaseDate: details.release_date,
		})
		.onConflictDoUpdate({
			target: movie.tmdbId,
			set: {
				title: details.title,
				posterPath: details.poster_path,
				releaseDate: details.release_date,
			},
		})
		.returning();

	return insertedMovie;
}

export async function findMovieByTmdbId(tmdbId: number) {
	const [existingMovie] = await db
		.select()
		.from(movie)
		.where(eq(movie.tmdbId, tmdbId));

	return existingMovie ?? null;
}

export async function getWatchlistStatus(userId: string, tmdbId: number) {
	const [existing] = await db
		.select({ id: watchlist.id })
		.from(watchlist)
		.innerJoin(movie, eq(watchlist.movieId, movie.id))
		.where(and(eq(watchlist.userId, userId), eq(movie.tmdbId, tmdbId)));

	return Boolean(existing);
}
