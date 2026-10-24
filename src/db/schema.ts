import type { TitleSource } from "@watchmode/api-client";
import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	real,
	smallint,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const movie = pgTable("movie", {
	id: integer("id").primaryKey(),
	title: text("title").notNull(),
	releaseDate: text("release_date"),
	posterPath: text("poster_path"),
	backdropPath: text("backdrop_path"),
	runtime: integer("runtime"),
	voteAverage: real("vote_average"),
	addedAt: timestamp("created_at").defaultNow().notNull(),
});

export const genre = pgTable("genre", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
});

export const movieToGenre = pgTable(
	"movie_to_genre",
	{
		movieId: integer("movie_id")
			.notNull()
			.references(() => movie.id, { onDelete: "cascade" }),
		genreId: integer("genre_id")
			.notNull()
			.references(() => genre.id, { onDelete: "cascade" }),
	},
	(t) => [primaryKey({ columns: [t.movieId, t.genreId] })],
);

export const watchlistStatusEnum = pgEnum("status", [
	"want_to_watch",
	"watched",
]);

export const watchlist = pgTable(
	"watchlist",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		movieId: integer("movie_id")
			.notNull()
			.references(() => movie.id, { onDelete: "cascade" }),
		status: watchlistStatusEnum().notNull().default("want_to_watch"),
		addedAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		watchedAt: timestamp("watched_at"),
	},
	(table) => [
		uniqueIndex("watchlist_user_movie_unique").on(table.userId, table.movieId),
		index("watchlist_user_id_idx").on(table.userId),
	],
);

export const streamingSource = pgTable("streaming_source", {
	imdbId: text("imdb_id").primaryKey(),
	sources: jsonb("sources").$type<TitleSource[]>().notNull(),
	fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const imdbRating = pgTable("imdb_rating", {
	imdbId: text("imdb_id").primaryKey(),
	imdbRating: text("imdb_rating"),
	imdbVotes: text("imdb_votes"),
	fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

// Sound: Dolby Atmos showcase titles, community Atmos votes and sound ratings.
// Keyed by TMDB id + media type so TV shows can join without a migration.
export const mediaTypeEnum = pgEnum("media_type", ["movie", "tv"]);

export const atmosTitleSourceEnum = pgEnum("atmos_title_source", [
	"curated",
	"community",
]);

export const listeningSetupEnum = pgEnum("listening_setup", [
	"tv_speakers",
	"soundbar",
	"atmos_soundbar",
	"surround",
	"atmos_surround",
	"headphones",
]);

export const atmosTitle = pgTable(
	"atmos_title",
	{
		tmdbId: integer("tmdb_id").notNull(),
		mediaType: mediaTypeEnum("media_type").notNull(),
		title: text("title").notNull(),
		releaseDate: text("release_date"),
		posterPath: text("poster_path"),
		backdropPath: text("backdrop_path"),
		source: atmosTitleSourceEnum("source").notNull(),
		// Matches an entry in the curated seed list, so it is only resolved once.
		seedKey: text("seed_key").unique(),
		note: text("note"),
		addedAt: timestamp("created_at").defaultNow().notNull(),
	},
	(t) => [primaryKey({ columns: [t.tmdbId, t.mediaType] })],
);

export const atmosVote = pgTable(
	"atmos_vote",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		tmdbId: integer("tmdb_id").notNull(),
		mediaType: mediaTypeEnum("media_type").notNull(),
		hasAtmos: boolean("has_atmos").notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.userId, t.tmdbId, t.mediaType] }),
		index("atmos_vote_title_idx").on(t.tmdbId, t.mediaType),
	],
);

export const soundRating = pgTable(
	"sound_rating",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		tmdbId: integer("tmdb_id").notNull(),
		mediaType: mediaTypeEnum("media_type").notNull(),
		// 1 to 10.
		overall: smallint("overall").notNull(),
		// Optional 1 to 5 sub-scores.
		immersion: smallint("immersion"),
		bass: smallint("bass"),
		dialogue: smallint("dialogue"),
		setup: listeningSetupEnum("setup"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.userId, t.tmdbId, t.mediaType] }),
		index("sound_rating_title_idx").on(t.tmdbId, t.mediaType),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	watchlistEntries: many(watchlist),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const movieRelations = relations(movie, ({ many }) => ({
	watchlistEntries: many(watchlist),
	movieToGenres: many(movieToGenre),
}));

export const genreRelations = relations(genre, ({ many }) => ({
	movieToGenres: many(movieToGenre),
}));

export const movieToGenreRelations = relations(movieToGenre, ({ one }) => ({
	movie: one(movie, {
		fields: [movieToGenre.movieId],
		references: [movie.id],
	}),
	genre: one(genre, {
		fields: [movieToGenre.genreId],
		references: [genre.id],
	}),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
	movie: one(movie, {
		fields: [watchlist.movieId],
		references: [movie.id],
	}),
	user: one(user, {
		fields: [watchlist.userId],
		references: [user.id],
	}),
}));
