CREATE TABLE "imdb_rating" (
	"imdb_id" text PRIMARY KEY NOT NULL,
	"imdb_rating" text,
	"imdb_votes" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
