ALTER TABLE "movie" DROP CONSTRAINT "movie_tmdb_id_unique";--> statement-breakpoint
ALTER TABLE "movie" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "movie" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "watchlist" ALTER COLUMN "movie_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "movie" ADD COLUMN "backdrop_path" text;--> statement-breakpoint
ALTER TABLE "watchlist" ADD COLUMN "watched_at" timestamp;--> statement-breakpoint
ALTER TABLE "movie" DROP COLUMN "tmdb_id";