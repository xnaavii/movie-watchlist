import type { MediaType } from "../types";

type Sluggable = { id: number; title: string };

export const slugify = (text: string): string =>
	text
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/['’]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

// Movie and TV slugs keep the TMDB id up front for lookups, e.g. "550-fight-club".
// Titles with no latin characters fall back to the bare id.
export const toMediaSlug = ({ id, title }: Sluggable): string => {
	const titleSlug = slugify(title);
	return titleSlug ? `${id}-${titleSlug}` : `${id}`;
};

export const parseMediaSlug = (slug: string): number | null => {
	const match = /^(\d+)(?:-[a-z0-9-]*)?$/i.exec(slug);
	return match ? Number(match[1]) : null;
};

const MEDIA_PATH_PREFIX: Record<MediaType, string> = {
	movie: "/movies",
	tv: "/tv",
};

/** The details page path, e.g. "/movies/550-fight-club" or "/tv/1399-game-of-thrones". */
export const toMediaPath = (media: Sluggable & { mediaType: MediaType }) =>
	`${MEDIA_PATH_PREFIX[media.mediaType]}/${toMediaSlug(media)}`;
