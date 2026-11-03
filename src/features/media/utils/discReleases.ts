import type { MovieReleaseDateResult } from "@lorenzopant/tmdb";
import { WATCH_REGIONS } from "./watchProviders";

/** Disc formats, best picture and sound first. */
export const DISC_FORMATS = {
	uhd: {
		label: "4K UHD Blu-ray",
		quality: "4K, usually with HDR and lossless audio",
	},
	bluray: { label: "Blu-ray", quality: "1080p with lossless audio" },
	dvd: { label: "DVD", quality: "Standard definition" },
} as const;

export type DiscFormat = keyof typeof DISC_FORMATS;

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

export type DiscRelease = {
	region: string;
	/** ISO date, YYYY-MM-DD. */
	date: string;
	/** Empty when TMDB doesn't say which formats. */
	formats: DiscFormat[];
};

export type DiscReleases = {
	releases: DiscRelease[];
	/** Every format seen across the releases, best first. */
	formats: DiscFormat[];
};

/** Collects the disc releases in the regions we show, in region order. */
export function pickDiscReleases(
	results: MovieReleaseDateResult[],
	regions: readonly string[] = WATCH_REGIONS,
): DiscReleases | null {
	const releases = regions.flatMap((region) =>
		(
			results.find((result) => result.iso_3166_1 === region)?.release_dates ??
			[]
		)
			.filter((release) => release.type === PHYSICAL_RELEASE)
			.map((release) => ({
				region,
				date: release.release_date.slice(0, 10),
				formats: parseDiscFormats(release.note ?? ""),
			}))
			.sort((a, b) => a.date.localeCompare(b.date)),
	);
	if (releases.length === 0) return null;

	const seen = new Set(releases.flatMap((release) => release.formats));
	return {
		releases,
		formats: DISC_FORMAT_ORDER.filter((format) => seen.has(format)),
	};
}
