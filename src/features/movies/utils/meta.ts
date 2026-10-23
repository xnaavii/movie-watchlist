import type { MovieDetails } from "@lorenzopant/tmdb";
import { SITE_CONFIG } from "#/config/site";
import { seo, truncateForMeta, truncateTitle } from "#/utils/seo";
import { toTmdbImageUrl } from "./tmdb";

/**
 * Builds the head tags for a movie details page: title, description,
 * Open Graph / Twitter link previews, a canonical link and Movie JSON-LD.
 */
export function buildMovieHead(movie: MovieDetails, url: string) {
	const year = movie.release_date?.slice(0, 4);
	const title = `${truncateTitle(movie.title)}${year ? ` (${year})` : ""} | ${SITE_CONFIG.name}`;
	const description = truncateForMeta(
		movie.overview || movie.tagline || undefined,
		155,
	);
	const backdrop = toTmdbImageUrl(movie.backdrop_path, "w1280");
	const poster = toTmdbImageUrl(movie.poster_path, "w780");
	const image = backdrop ?? poster;

	const meta = [
		...seo({
			title,
			description,
			image,
			imageAlt: image ? movie.title : undefined,
			url,
			type: "video.movie",
			siteName: SITE_CONFIG.name,
			twitterCard: backdrop ? "summary_large_image" : "summary",
		}),
		...(movie.release_date
			? [{ property: "video:release_date", content: movie.release_date }]
			: []),
		...(movie.runtime
			? [{ property: "video:duration", content: String(movie.runtime * 60) }]
			: []),
	];

	return {
		meta,
		links: [{ rel: "canonical", href: url }],
		scripts: [
			{
				type: "application/ld+json",
				children: toJsonLd(buildMovieJsonLd(movie, url, poster ?? backdrop)),
			},
		],
	};
}

/** Serialises JSON-LD so text like "</script>" in an overview can't end the tag. */
function toJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

function buildMovieJsonLd(
	movie: MovieDetails,
	url: string,
	image: string | undefined,
) {
	return {
		"@context": "https://schema.org",
		"@type": "Movie",
		name: movie.title,
		url,
		...(movie.overview ? { description: movie.overview } : {}),
		...(image ? { image } : {}),
		...(movie.release_date ? { datePublished: movie.release_date } : {}),
		...(movie.runtime ? { duration: `PT${movie.runtime}M` } : {}),
		...(movie.genres?.length
			? { genre: movie.genres.map((genre) => genre.name) }
			: {}),
		...(movie.vote_count > 0
			? {
					aggregateRating: {
						"@type": "AggregateRating",
						ratingValue: Number(movie.vote_average.toFixed(1)),
						bestRating: 10,
						worstRating: 0,
						ratingCount: movie.vote_count,
					},
				}
			: {}),
	};
}
