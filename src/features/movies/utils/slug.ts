type Sluggable = { id: number; title: string };
type NamedGenre = { id: number; name: string };

export const slugify = (text: string): string =>
	text
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/['’]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

// Movie slugs keep the TMDB id up front for lookups, e.g. "550-fight-club".
// Titles with no latin characters fall back to the bare id.
export const toMovieSlug = ({ id, title }: Sluggable): string => {
	const titleSlug = slugify(title);
	return titleSlug ? `${id}-${titleSlug}` : `${id}`;
};

export const parseMovieSlug = (movieSlug: string): number | null => {
	const match = /^(\d+)(?:-[a-z0-9-]*)?$/i.exec(movieSlug);
	return match ? Number(match[1]) : null;
};

export const toGenreSlug = ({ name }: NamedGenre): string => slugify(name);

// Accepts the readable slug or a legacy numeric id so old links keep working.
export const findGenreBySlug = <T extends NamedGenre>(
	genres: T[],
	genreSlug: string,
): T | undefined =>
	genres.find(
		(genre) =>
			toGenreSlug(genre) === genreSlug || String(genre.id) === genreSlug,
	);
