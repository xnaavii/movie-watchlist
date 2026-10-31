import type { DiscoverMovieParams, DiscoverTVParams } from "@lorenzopant/tmdb";
import { z } from "zod";
import { MEDIA_TYPES } from "./types";

/**
 * Input schemas for the media server functions. Server functions are public
 * HTTP endpoints, so every input is checked at runtime, not just typed.
 * Parsing also drops extra fields, so a caller can pass a whole media item
 * where a ref is expected.
 */

export const mediaTypeSchema = z.enum(MEDIA_TYPES);

/** TMDB ids are positive integers. */
export const tmdbIdSchema = z.number().int().positive();

/** TMDB serves at most 500 pages of any list. */
export const pageSchema = z.number().int().min(1).max(500);

export const mediaRefSchema = z.object({
	mediaType: mediaTypeSchema,
	id: tmdbIdSchema,
});

export const mediaPageRequestSchema = mediaRefSchema.extend({
	page: pageSchema.optional(),
});

export const mediaTypeRequestSchema = z.object({ mediaType: mediaTypeSchema });

export const mediaListRequestSchema = z
	.discriminatedUnion("mediaType", [
		z.object({
			mediaType: z.literal("movie"),
			list: z.enum(["popular", "now_playing", "top_rated", "upcoming"]),
		}),
		z.object({
			mediaType: z.literal("tv"),
			list: z.enum(["popular", "airing_today", "on_the_air", "top_rated"]),
		}),
	])
	.and(z.object({ page: pageSchema.optional() }));

export const mediaImagesRequestSchema = mediaRefSchema.extend({
	include_image_language: z.array(z.enum(["en", "null"])).optional(),
});

/** Most titles a row or carousel shows at once. */
export const MAX_LOGO_TITLES = 24;

export const mediaLogosRequestSchema = z
	.array(mediaRefSchema)
	.transform((refs) => refs.slice(0, MAX_LOGO_TITLES));

/**
 * TMDB discover filters are flat strings, numbers and booleans. Checking the
 * shape keeps odd values out of TMDB calls and edge cache keys.
 */
function isFlatParams(value: unknown): boolean {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return false;
	}
	return Object.values(value).every(
		(v) =>
			v === undefined ||
			typeof v === "number" ||
			typeof v === "boolean" ||
			(typeof v === "string" && v.length <= 200),
	);
}

export const mediaDiscoverRequestSchema = z.discriminatedUnion("mediaType", [
	z.object({
		mediaType: z.literal("movie"),
		params: z.custom<DiscoverMovieParams>(isFlatParams),
	}),
	z.object({
		mediaType: z.literal("tv"),
		params: z.custom<DiscoverTVParams>(isFlatParams),
	}),
]);
export type MediaDiscoverRequest = z.infer<typeof mediaDiscoverRequestSchema>;

export const trendingRequestSchema = z.object({
	mediaType: mediaTypeSchema,
	time_window: z.enum(["day", "week"]),
	page: pageSchema.optional(),
});

const searchQuerySchema = z.string().trim().min(1).max(500);

export const searchRequestSchema = z.object({
	query: searchQuerySchema,
	page: pageSchema.optional(),
	resolved: z
		.object({
			query: searchQuerySchema,
			year: z
				.string()
				.regex(/^\d{4}$/)
				.optional(),
			fuzzy: z.boolean(),
		})
		.optional(),
});

/** IMDb ids look like tt0111161. */
export const imdbIdRequestSchema = z.object({
	imdbId: z.string().regex(/^tt\d{5,10}$/),
});
