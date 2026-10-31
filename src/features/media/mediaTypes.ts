import { Clapperboard, type LucideIcon, Tv } from "lucide-react";
import type { MediaType } from "./types";

/**
 * Everything the UI says or shows differently per media type, in one place.
 * Adding a media type starts here: TypeScript then points at every other
 * place that needs a case for it (exhaustive switches and Record<MediaType>).
 */
export interface MediaTypeConfig {
	/** "Movie", for a single title's type. */
	label: string;
	/** "Movies", for headings, tabs and filters. */
	pluralLabel: string;
	/** "movie", mid-sentence. */
	noun: string;
	/** "movies", mid-sentence. */
	pluralNoun: string;
	/** Heading of the "more like this" row on a details page. */
	similarHeading: string;
	/** The schema.org type for structured data. */
	schemaType: "Movie" | "TVSeries";
	icon: LucideIcon;
}

export const MEDIA_TYPE_CONFIG: Record<MediaType, MediaTypeConfig> = {
	movie: {
		label: "Movie",
		pluralLabel: "Movies",
		noun: "movie",
		pluralNoun: "movies",
		similarHeading: "Similar movie recommendations",
		schemaType: "Movie",
		icon: Clapperboard,
	},
	tv: {
		label: "TV show",
		pluralLabel: "TV shows",
		noun: "TV show",
		pluralNoun: "TV shows",
		similarHeading: "Shows you might also like",
		schemaType: "TVSeries",
		icon: Tv,
	},
};

/** "movies and TV shows", "movies" or "TV shows". */
export function joinPluralNouns(mediaTypes: readonly MediaType[]): string {
	return mediaTypes
		.map((mediaType) => MEDIA_TYPE_CONFIG[mediaType].pluralNoun)
		.join(" and ");
}
