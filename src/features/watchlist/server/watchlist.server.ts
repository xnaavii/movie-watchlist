import { and, count, desc, eq } from "drizzle-orm";
import { db } from "#/db";
import { genre, movie, movieToGenre, watchlist } from "#/db/schema";
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

export async function addMovieWithGenres({
	newMovie,
	genres,
}: {
	newMovie: Movie;
	genres: { id: number; name: string }[];
}) {
	const [insertedMovie] = await db
		.insert(movie)
		.values(newMovie)
		.onConflictDoUpdate({
			target: movie.id,
			set: {
				title: newMovie.title,
				posterPath: newMovie.posterPath,
				backdropPath: newMovie.backdropPath,
				releaseDate: newMovie.releaseDate,
			},
		})
		.returning();

	if (genres && genres.length > 0) {
		await db.insert(genre).values(genres).onConflictDoNothing();

		const junctionRows = genres.map((g) => ({
			movieId: newMovie.id,
			genreId: g.id,
		}));

		await db.insert(movieToGenre).values(junctionRows).onConflictDoNothing();
	}

	return insertedMovie;
}

export async function findOrCreateMovie(movieId: number) {
	const [existingMovie] = await db
		.select()
		.from(movie)
		.where(eq(movie.id, movieId));

	if (existingMovie) {
		const [{ genreCount }] = await db
			.select({ genreCount: count(movieToGenre.genreId) })
			.from(movieToGenre)
			.where(eq(movieToGenre.movieId, movieId));

		if (Number(genreCount) > 0) {
			return existingMovie;
		}
	}

	const details = await getMovieDetails({ data: { movie_id: movieId } });

	return await addMovieWithGenres({
		newMovie: {
			id: movieId,
			title: details.title,
			posterPath: details.poster_path,
			backdropPath: details.backdrop_path,
			releaseDate: details.release_date,
		},
		genres: details.genres ?? [],
	});
}

export async function findMovieById(movieId: number) {
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

export async function selectWatchlistMoviesByGenreId(
	userId: string,
	genreId: number,
) {
	const movies = await db
		.select({
			id: movie.id,
			title: movie.title,
			posterPath: movie.posterPath,
			backdropPath: movie.backdropPath,
			releaseDate: movie.releaseDate,
			addedAt: watchlist.addedAt,
		})
		.from(watchlist)
		.innerJoin(movie, eq(watchlist.movieId, movie.id))
		.innerJoin(movieToGenre, eq(movie.id, movieToGenre.movieId))
		.where(and(eq(watchlist.userId, userId), eq(movieToGenre.genreId, genreId)))
		.orderBy(desc(watchlist.addedAt));

	return movies;
}
