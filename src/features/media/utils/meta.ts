import { SITE_CONFIG } from "#/config/site";
import { seo, truncateForMeta, truncateTitle } from "#/utils/seo";
import type { MediaDetails } from "../types";
import { toTmdbImageUrl } from "./tmdb";

/**
 * Builds the head tags for a movie or TV show details page: title,
 * description, Open Graph / Twitter link previews, a canonical link and
 * Movie or TVSeries JSON-LD.
 */
export function buildMediaHead(media: MediaDetails, url: string) {
	const isMovie = media.mediaType === "movie";
	const year = media.releaseDate?.slice(0, 4);
	const title = `${truncateTitle(media.title)}${year ? ` (${year})` : ""} | ${SITE_CONFIG.name}`;
	const description = truncateForMeta(
		media.overview || media.tagline || undefined,
		155,
	);
	const backdrop = toTmdbImageUrl(media.backdropPath, "w1280");
	const poster = toTmdbImageUrl(media.posterPath, "w780");
	const image = backdrop ?? poster;

	const meta = [
		...seo({
			title,
			description,
			image,
			imageAlt: image ? media.title : undefined,
			url,
			type: isMovie ? "video.movie" : "video.tv_show",
			siteName: SITE_CONFIG.name,
			twitterCard: backdrop ? "summary_large_image" : "summary",
		}),
		...(media.releaseDate
			? [{ property: "video:release_date", content: media.releaseDate }]
			: []),
		...(isMovie && media.runtime
			? [{ property: "video:duration", content: String(media.runtime * 60) }]
			: []),
	];

	return {
		meta,
		links: [{ rel: "canonical", href: url }],
		scripts: [
			{
				type: "application/ld+json",
				children: toJsonLd(buildMediaJsonLd(media, url, poster ?? backdrop)),
			},
		],
	};
}

/** Serialises JSON-LD so text like "</script>" in an overview can't end the tag. */
function toJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

function buildMediaJsonLd(
	media: MediaDetails,
	url: string,
	image: string | undefined,
) {
	const isMovie = media.mediaType === "movie";
	return {
		"@context": "https://schema.org",
		"@type": isMovie ? "Movie" : "TVSeries",
		name: media.title,
		url,
		...(media.overview ? { description: media.overview } : {}),
		...(image ? { image } : {}),
		...(media.releaseDate
			? { [isMovie ? "datePublished" : "startDate"]: media.releaseDate }
			: {}),
		...(isMovie && media.runtime ? { duration: `PT${media.runtime}M` } : {}),
		...(!isMovie && media.numberOfSeasons
			? { numberOfSeasons: media.numberOfSeasons }
			: {}),
		...(!isMovie && media.numberOfEpisodes
			? { numberOfEpisodes: media.numberOfEpisodes }
			: {}),
		...(media.genres?.length
			? { genre: media.genres.map((genre) => genre.name) }
			: {}),
		...(media.voteCount && media.voteCount > 0 && media.voteAverage
			? {
					aggregateRating: {
						"@type": "AggregateRating",
						ratingValue: Number(media.voteAverage.toFixed(1)),
						bestRating: 10,
						worstRating: 0,
						ratingCount: media.voteCount,
					},
				}
			: {}),
	};
}
