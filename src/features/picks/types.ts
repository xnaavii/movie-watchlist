import type { MovieResultItem } from "@lorenzopant/tmdb";
import { z } from "zod";

export const PICK_MOODS = [
	"Cozy",
	"Funny",
	"Mind-bending",
	"Tense",
	"Feel-good",
	"Epic",
	"Romantic",
	"Scary",
	"Thought-provoking",
] as const;

export const PICK_TIMES = [
	{ value: "short", label: "Under 90 min", maxRuntime: 90 },
	{ value: "medium", label: "Around 2 hours", maxRuntime: 130 },
	{ value: "any", label: "Any length", maxRuntime: undefined },
] as const;

export const PICK_COMPANY = [
	"Solo",
	"Date night",
	"Friends",
	"Family",
] as const;

export const MAX_PROMPT_LENGTH = 300;

/** Error messages the UI recognises and explains. */
export const PICK_ERRORS = {
	notConfigured: "AI_NOT_CONFIGURED",
	rateLimited: "RATE_LIMITED",
} as const;

/** What the user asks for, from the picker form or a descriptive search. */
export const pickRequestSchema = z.object({
	prompt: z
		.string()
		.catch("")
		.transform((prompt) => prompt.trim().slice(0, MAX_PROMPT_LENGTH)),
	moods: z.array(z.enum(PICK_MOODS)).max(4).catch([]),
	time: z.enum(["short", "medium", "any"]).catch("any"),
	company: z.enum(PICK_COMPANY).optional().catch(undefined),
	useWatchlist: z.boolean().catch(false),
});

export type PickRequest = z.infer<typeof pickRequestSchema>;

/**
 * What the model reads out of the request, mapped onto TMDB discover filters.
 * Every field is nullable rather than optional so structured outputs always
 * returns the full shape.
 */
export const pickIntentSchema = z.object({
	summary: z
		.string()
		.describe(
			'A short headline for what the user wants, e.g. "Cozy 90s mysteries under 2 hours".',
		),
	genres: z
		.array(z.string())
		.describe("One to three genre names, copied exactly from the genre list."),
	excludeGenres: z
		.array(z.string())
		.describe("Genre names the user clearly does not want."),
	keywords: z
		.array(z.string())
		.describe(
			'Up to four short TMDB-style keywords for themes or settings, e.g. "whodunit", "small town", "heist".',
		),
	similarTo: z
		.array(z.string())
		.describe("Titles the user named as a reference, e.g. Knives Out."),
	releaseYearFrom: z.number().int().nullable(),
	releaseYearTo: z.number().int().nullable(),
	minRuntime: z.number().int().nullable().describe("Minutes."),
	maxRuntime: z.number().int().nullable().describe("Minutes."),
	minRating: z.number().nullable().describe("TMDB rating from 0 to 10."),
	originalLanguage: z
		.string()
		.nullable()
		.describe('ISO 639-1 code, only when the user asks, e.g. "ko".'),
	sort: z.enum(["popular", "top_rated", "newest"]),
});

export type PickIntent = z.infer<typeof pickIntentSchema>;

export const pickRankingSchema = z.object({
	picks: z.array(
		z.object({
			id: z.number().int().describe("The candidate id."),
			reason: z
				.string()
				.describe("One sentence, under 25 words, on why it fits this request."),
		}),
	),
});

export type PickRanking = z.infer<typeof pickRankingSchema>;

/** One candidate as the ranking model sees it. */
export type PickCandidate = {
	id: number;
	title: string;
	year: string;
	genres: string[];
	rating: number;
	overview: string;
	onWatchlist: boolean;
};

export type Pick = {
	/** Kept so TV shows can join the same list later. */
	mediaType: "movie";
	movie: MovieResultItem;
	reason: string;
	onWatchlist: boolean;
};

export type PickResponse = {
	summary: string;
	picks: Pick[];
	/** The rest of the candidates, for browsing past the top picks. */
	more: MovieResultItem[];
};
