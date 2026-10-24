import { z } from "zod";

import { MEDIA_TYPES } from "#/features/media/types";

export { MEDIA_TYPES, type MediaType } from "#/features/media/types";

export const LISTENING_SETUPS = [
	{ value: "tv_speakers", label: "TV speakers" },
	{ value: "soundbar", label: "Soundbar" },
	{ value: "atmos_soundbar", label: "Atmos soundbar" },
	{ value: "surround", label: "5.1 / 7.1" },
	{ value: "atmos_surround", label: "Atmos surround" },
	{ value: "headphones", label: "Headphones" },
] as const;
export type ListeningSetup = (typeof LISTENING_SETUPS)[number]["value"];

export const SUB_SCORES = [
	{
		key: "immersion",
		label: "Immersion",
		hint: "Surround and overhead effects",
	},
	{ key: "bass", label: "Bass", hint: "Low end and impact" },
	{ key: "dialogue", label: "Dialogue", hint: "Clear over the mix" },
] as const;
export type SubScoreKey = (typeof SUB_SCORES)[number]["key"];

export const OVERALL_MAX = 10;
export const SUB_SCORE_MAX = 5;

export const titleRefSchema = z.object({
	tmdbId: z.number().int().positive(),
	mediaType: z.enum(MEDIA_TYPES),
});
export type TitleRef = z.infer<typeof titleRefSchema>;

const subScore = z.number().int().min(1).max(SUB_SCORE_MAX).nullable();

export const soundRatingInputSchema = titleRefSchema.extend({
	overall: z.number().int().min(1).max(OVERALL_MAX),
	immersion: subScore,
	bass: subScore,
	dialogue: subScore,
	setup: z
		.enum(LISTENING_SETUPS.map((s) => s.value) as [ListeningSetup])
		.nullable(),
});
export type SoundRatingInput = z.infer<typeof soundRatingInputSchema>;

export const atmosVoteInputSchema = titleRefSchema.extend({
	hasAtmos: z.boolean(),
});
export type AtmosVoteInput = z.infer<typeof atmosVoteInputSchema>;

/** Averages over every rating of one title; sub-scores skip unrated rows. */
export type SoundAggregate = {
	count: number;
	overall: number | null;
	immersion: number | null;
	bass: number | null;
	dialogue: number | null;
};

export type AtmosShowcaseItem = TitleRef & {
	title: string;
	releaseDate: string | null;
	posterPath: string | null;
	backdropPath: string | null;
	note: string | null;
	sound: SoundAggregate;
	/** Bayesian sound score used for ranking, on the 1 to 10 scale. */
	score: number;
};

export type TitleSound = {
	isAtmos: boolean;
	curatedNote: string | null;
	votes: { yes: number; no: number };
	sound: SoundAggregate;
	myVote: boolean | null;
	myRating: Omit<SoundRatingInput, "tmdbId" | "mediaType"> | null;
};
