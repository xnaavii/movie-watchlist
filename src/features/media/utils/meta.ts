import { absoluteUrl, SITE_CONFIG } from "#/config/site";
import {
	pageHead,
	pageTitle,
	type SeoImage,
	toJsonLd,
	truncateForMeta,
	truncateTitle,
} from "#/utils/seo";
import type { MediaDetails } from "../types";
import { toMediaPath } from "./slug";
import { toTmdbImageUrl } from "./tmdb";

/** TMDB backdrops at w1280 are always 1280x720. */
const BACKDROP_SIZE = { width: 1280, height: 720 } as const;
/** TMDB posters at w780 are 780x1170. */
const POSTER_SIZE = { width: 780, height: 1170 } as const;

/**
 * A link preview image from a TMDB backdrop, e.g. the top title on a
 * discover page. Undefined (so the branded image is used) without one.
 */
export function backdropPreview(
	backdropPath: string | null | undefined,
	alt?: string,
): SeoImage | undefined {
	const url = toTmdbImageUrl(backdropPath, "w1280");
	return url ? { url, alt, ...BACKDROP_SIZE } : undefined;
}

/**
 * Builds the head tags for a movie or TV show details page: title,
 * description, Open Graph / Twitter link previews with the backdrop (or the
 * poster), a canonical link and Movie or TVSeries JSON-LD.
 */
export function buildMediaHead(media: MediaDetails) {
	const isMovie = media.mediaType === "movie";
	const path = toMediaPath(media);
	const url = absoluteUrl(path);
	const year = media.releaseDate?.slice(0, 4);
	const title = pageTitle(
		`${truncateTitle(media.title)}${year ? ` (${year})` : ""}`,
	);
	const description =
		truncateForMeta(media.overview || media.tagline || undefined, 155) ??
		`Where to stream ${media.title}, plus the trailer, cast and reviews. Save it to your ${SITE_CONFIG.name}.`;
	const backdrop = toTmdbImageUrl(media.backdropPath, "w1280");
	const poster = toTmdbImageUrl(media.posterPath, "w780");
	const image: SeoImage | undefined = backdrop
		? { url: backdrop, alt: media.title, ...BACKDROP_SIZE }
		: poster
			? { url: poster, alt: `${media.title} poster`, ...POSTER_SIZE }
			: undefined;

	const head = pageHead({
		title,
		description,
		path,
		image,
		type: isMovie ? "video.movie" : "video.tv_show",
		// A tall poster is cropped badly in a wide card.
		twitterCard: !backdrop && poster ? "summary" : "summary_large_image",
	});

	return {
		meta: [
			...head.meta,
			...(media.releaseDate
				? [{ property: "video:release_date", content: media.releaseDate }]
				: []),
			...(isMovie && media.runtime
				? [{ property: "video:duration", content: String(media.runtime * 60) }]
				: []),
		],
		links: head.links,
		scripts: [
			{
				type: "application/ld+json",
				children: toJsonLd(buildMediaJsonLd(media, url, poster ?? backdrop)),
			},
		],
	};
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
