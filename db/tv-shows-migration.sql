-- Movies and TV shows share the watchlist. TMDB ids only identify a title
-- together with its media type, so every table that pointed at movie(id) now
-- points at media(tmdb_id, media_type). Existing rows are all movies.
-- Hand-written: the prod database has no drizzle migration history, and
-- `drizzle-kit push` can't rename tables and move keys without losing data.
-- Apply once with psql (or the Neon SQL editor); afterwards `pnpm db:push`
-- should report no changes.
BEGIN;

ALTER TABLE "movie" RENAME TO "media";
ALTER TABLE "media" RENAME COLUMN "id" TO "tmdb_id";
ALTER TABLE "movie_to_genre" RENAME TO "media_to_genre";
ALTER TABLE "media_to_genre" RENAME COLUMN "movie_id" TO "tmdb_id";
ALTER TABLE "watchlist" RENAME COLUMN "movie_id" TO "tmdb_id";

-- Drop the old keys, whatever they were named, except the watchlist's own id
-- and its link to the user.
DO $$
DECLARE r record;
BEGIN
	FOR r IN
		SELECT conrelid::regclass AS tbl, conname
		FROM pg_constraint
		WHERE conrelid IN ('media'::regclass, 'media_to_genre'::regclass, 'watchlist'::regclass)
			AND contype IN ('p', 'f')
			AND NOT (conrelid = 'watchlist'::regclass AND contype = 'p')
			AND NOT (conrelid = 'watchlist'::regclass AND confrelid = '"user"'::regclass)
		-- Foreign keys first, they depend on the primary keys.
		ORDER BY contype = 'p'
	LOOP
		EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
	END LOOP;
END $$;
DROP INDEX IF EXISTS "watchlist_user_movie_unique";

ALTER TABLE "media" ADD COLUMN "media_type" "media_type" NOT NULL DEFAULT 'movie';
ALTER TABLE "media" ALTER COLUMN "media_type" DROP DEFAULT;
ALTER TABLE "media_to_genre" ADD COLUMN "media_type" "media_type" NOT NULL DEFAULT 'movie';
ALTER TABLE "media_to_genre" ALTER COLUMN "media_type" DROP DEFAULT;
ALTER TABLE "watchlist" ADD COLUMN "media_type" "media_type" NOT NULL DEFAULT 'movie';
ALTER TABLE "watchlist" ALTER COLUMN "media_type" DROP DEFAULT;

ALTER TABLE "media" ADD CONSTRAINT "media_tmdb_id_media_type_pk" PRIMARY KEY ("tmdb_id", "media_type");
ALTER TABLE "media_to_genre" ADD CONSTRAINT "media_to_genre_tmdb_id_genre_id_media_type_pk" PRIMARY KEY ("tmdb_id", "genre_id", "media_type");
ALTER TABLE "media_to_genre" ADD CONSTRAINT "media_to_genre_genre_id_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "genre"("id") ON DELETE cascade;
ALTER TABLE "media_to_genre" ADD CONSTRAINT "media_to_genre_media_fk" FOREIGN KEY ("tmdb_id", "media_type") REFERENCES "media"("tmdb_id", "media_type") ON DELETE cascade;
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_media_fk" FOREIGN KEY ("tmdb_id", "media_type") REFERENCES "media"("tmdb_id", "media_type") ON DELETE cascade;
CREATE UNIQUE INDEX "watchlist_user_media_unique" ON "watchlist" USING btree ("user_id", "tmdb_id", "media_type");

COMMIT;
