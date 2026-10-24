import { slugify } from "#/features/movies/utils/slug";
import type { AtmosSeed } from "../seed";
import type { AtmosShowcaseItem, SoundAggregate } from "../types";

/** How many average ratings a title's score is pulled toward the prior. */
export const SCORE_PRIOR_WEIGHT = 3;
/** Neutral-good starting score for a title nobody has rated yet. */
export const SCORE_PRIOR_MEAN = 7;

export const EMPTY_SOUND: SoundAggregate = {
	count: 0,
	overall: null,
	immersion: null,
	bass: null,
	dialogue: null,
};

/**
 * Bayesian average, so one 10 doesn't outrank fifty 9s and unrated titles sit
 * at the prior instead of the bottom.
 */
export function soundScore(
	sound: Pick<SoundAggregate, "count" | "overall">,
	priorMean = SCORE_PRIOR_MEAN,
	priorWeight = SCORE_PRIOR_WEIGHT,
): number {
	const total = (sound.overall ?? 0) * sound.count;
	return (priorMean * priorWeight + total) / (priorWeight + sound.count);
}

/**
 * Curated titles are trusted. Community titles need more yes than no votes,
 * so one mistaken vote can be outvoted.
 */
export function isAtmosTitle({
	curated,
	yes,
	no,
}: {
	curated: boolean;
	yes: number;
	no: number;
}): boolean {
	if (curated) return no <= yes + 2;
	return yes > no;
}

type SearchCandidate = {
	id: number;
	title?: string;
	name?: string;
	original_title?: string;
	original_name?: string;
	release_date?: string;
	first_air_date?: string;
};

/** Picks the search result for a seed: exact title and year first, then title, then year. */
export function matchSeedResult<T extends SearchCandidate>(
	seed: Pick<AtmosSeed, "title" | "year">,
	results: T[],
): T | undefined {
	const wanted = slugify(seed.title);
	const year = String(seed.year);
	const titles = (r: T) =>
		[r.title, r.name, r.original_title, r.original_name]
			.filter(Boolean)
			.map((t) => slugify(t as string));
	const yearOf = (r: T) =>
		(r.release_date || r.first_air_date || "").slice(0, 4);

	return (
		results.find((r) => titles(r).includes(wanted) && yearOf(r) === year) ??
		results.find((r) => titles(r).includes(wanted)) ??
		results.find((r) => yearOf(r) === year)
	);
}

export function sortShowcase(items: AtmosShowcaseItem[]): AtmosShowcaseItem[] {
	return [...items].sort(
		(a, b) => b.score - a.score || b.sound.count - a.sound.count,
	);
}

export function formatScore(value: number | null, digits = 1): string {
	return value == null ? "–" : value.toFixed(digits);
}
