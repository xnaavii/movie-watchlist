CREATE TABLE "streaming_source" (
	"imdb_id" text PRIMARY KEY NOT NULL,
	"sources" jsonb NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
