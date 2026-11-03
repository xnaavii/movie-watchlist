import type { MovieReleaseDateResult } from "@lorenzopant/tmdb";
import type { DiscFormat, DiscReleases } from "../types";
import { WATCH_REGIONS } from "./watchProviders";

/** Disc formats, best picture and sound first. */
export const DISC_FORMATS: Record<
	DiscFormat,
	{ label: string; quality: string }
> = {
	uhd: {
		label: "4K UHD Blu-ray",
		quality: "4K, usually with HDR and lossless audio",
	},
	bluray: { label: "Blu-ray", quality: "1080p with lossless audio" },
	dvd: { label: "DVD", quality: "Standard definition" },
};

const DISC_FORMAT_ORDER = Object.keys(DISC_FORMATS) as DiscFormat[];

/** TMDB's release type for DVD, Blu-ray and other disc releases. */
const PHYSICAL_RELEASE = 5;

const UHD = /\b(4k|uhd|ultra[\s-]?hd)\b(\s*blu[\s-]?ray)?/gi;
const BLU_RAY = /blu[\s-]?ray/i;
const DVD = /\bdvd\b/i;

/**
 * Reads the formats out of a TMDB release note such as "4K UHD + Blu-ray".
 * TMDB has no format field, so an empty note means "on disc, format unknown".
 */
export function parseDiscFormats(note: string): DiscFormat[] {
	const formats = new Set<DiscFormat>();
	const rest = note.replace(UHD, () => {
		formats.add("uhd");
		return "";
	});
	if (BLU_RAY.test(rest)) formats.add("bluray");
	if (DVD.test(rest)) formats.add("dvd");
	return DISC_FORMAT_ORDER.filter((format) => formats.has(format));
}

/**
 * One row per region we show, in region order: the first disc date and every
 * format TMDB's notes mention there. TMDB often adds a release twice, once
 * with a note and once without, so regions with no known format are dropped
 * when another region names one.
 */
export function pickDiscReleases(
	results: MovieReleaseDateResult[],
	regions: readonly string[] = WATCH_REGIONS,
): DiscReleases | null {
	const byRegion = regions.flatMap((region) => {
		const discs = (
			results.find((result) => result.iso_3166_1 === region)?.release_dates ??
			[]
		).filter((release) => release.type === PHYSICAL_RELEASE);
		if (discs.length === 0) return [];

		const formats = new Set(
			discs.flatMap((release) => parseDiscFormats(release.note ?? "")),
		);
		const date = discs
			.map((release) => release.release_date.slice(0, 10))
			.sort()[0];
		return [
			{
				region,
				date,
				formats: DISC_FORMAT_ORDER.filter((format) => formats.has(format)),
			},
		];
	});

	const known = byRegion.filter((release) => release.formats.length > 0);
	const releases = known.length > 0 ? known : byRegion;
	if (releases.length === 0) return null;

	const seen = new Set(releases.flatMap((release) => release.formats));
	return {
		releases,
		formats: DISC_FORMAT_ORDER.filter((format) => seen.has(format)),
	};
}
