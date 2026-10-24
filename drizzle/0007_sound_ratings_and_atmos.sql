CREATE TYPE "public"."atmos_title_source" AS ENUM('curated', 'community');--> statement-breakpoint
CREATE TYPE "public"."listening_setup" AS ENUM('tv_speakers', 'soundbar', 'atmos_soundbar', 'surround', 'atmos_surround', 'headphones');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('movie', 'tv');--> statement-breakpoint
CREATE TABLE "atmos_title" (
	"tmdb_id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"title" text NOT NULL,
	"release_date" text,
	"poster_path" text,
	"backdrop_path" text,
	"source" "atmos_title_source" NOT NULL,
	"seed_key" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "atmos_title_tmdb_id_media_type_pk" PRIMARY KEY("tmdb_id","media_type"),
	CONSTRAINT "atmos_title_seed_key_unique" UNIQUE("seed_key")
);
--> statement-breakpoint
CREATE TABLE "atmos_vote" (
	"user_id" text NOT NULL,
	"tmdb_id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"has_atmos" boolean NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "atmos_vote_user_id_tmdb_id_media_type_pk" PRIMARY KEY("user_id","tmdb_id","media_type")
);
--> statement-breakpoint
CREATE TABLE "sound_rating" (
	"user_id" text NOT NULL,
	"tmdb_id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"overall" smallint NOT NULL,
	"immersion" smallint,
	"bass" smallint,
	"dialogue" smallint,
	"setup" "listening_setup",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sound_rating_user_id_tmdb_id_media_type_pk" PRIMARY KEY("user_id","tmdb_id","media_type")
);
--> statement-breakpoint
ALTER TABLE "atmos_vote" ADD CONSTRAINT "atmos_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sound_rating" ADD CONSTRAINT "sound_rating_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "atmos_vote_title_idx" ON "atmos_vote" USING btree ("tmdb_id","media_type");--> statement-breakpoint
CREATE INDEX "sound_rating_title_idx" ON "sound_rating" USING btree ("tmdb_id","media_type");