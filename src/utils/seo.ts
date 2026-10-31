import { absoluteUrl, SITE_CONFIG } from "#/config/site";

export interface SeoImage {
	url: string;
	alt?: string;
	width?: number;
	height?: number;
}

export const seo = ({
	title,
	description,
	keywords,
	image,
	imageAlt,
	imageWidth,
	imageHeight,
	url,
	type = "website",
	siteName,
	twitterCard = "summary_large_image",
	noindex = false,
}: {
	title: string;
	description?: string;
	image?: string;
	imageAlt?: string;
	imageWidth?: number;
	imageHeight?: number;
	keywords?: string;
	url?: string;
	type?: string;
	siteName?: string;
	twitterCard?: "summary" | "summary_large_image";
	/** Keeps private or per-user pages out of search results. */
	noindex?: boolean;
}) => {
	const tags = [
		{ title },
		{ name: "description", content: description },
		{ name: "keywords", content: keywords },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ property: "og:type", content: type },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		...(siteName ? [{ property: "og:site_name", content: siteName }] : []),
		...(url
			? [
					{ property: "og:url", content: url },
					{ name: "twitter:url", content: url },
				]
			: []),
		...(image
			? [
					{ name: "twitter:image", content: image },
					{ name: "twitter:card", content: twitterCard },
					{ property: "og:image", content: image },
				]
			: []),
		...(image && imageWidth && imageHeight
			? [
					{ property: "og:image:width", content: String(imageWidth) },
					{ property: "og:image:height", content: String(imageHeight) },
				]
			: []),
		...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
		...(image && imageAlt
			? [
					{ name: "twitter:image:alt", content: imageAlt },
					{ property: "og:image:alt", content: imageAlt },
				]
			: []),
	];

	// Leave out tags with nothing to say, like an empty keywords tag.
	return tags.filter((tag) => !("content" in tag) || tag.content !== undefined);
};

/** Serialises JSON-LD so text like "</script>" in an overview can't end the tag. */
export function toJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** The branded link preview image, for pages without one of their own. */
export const defaultOgImage = (): SeoImage => ({
	url: absoluteUrl(SITE_CONFIG.ogImage.path),
	alt: SITE_CONFIG.ogImage.alt,
	width: SITE_CONFIG.ogImage.width,
	height: SITE_CONFIG.ogImage.height,
});

/** The title of the home page, and the default for every page. */
export const HOME_TITLE = `${SITE_CONFIG.name}: ${SITE_CONFIG.tagline}`;

/** "Dune (2021)" becomes "Dune (2021) | Watchlist". */
export const pageTitle = (title: string) => `${title} | ${SITE_CONFIG.name}`;

/**
 * Head tags for one page: title, description, a canonical link, and Open
 * Graph / Twitter tags for link previews. Pages without their own image use
 * the branded preview image. Pass `noindex` for private or per-user pages;
 * they get no canonical link, since search engines shouldn't list them.
 */
export function pageHead({
	title,
	description = SITE_CONFIG.description,
	path,
	image,
	type,
	noindex = false,
	jsonLd,
	twitterCard,
}: {
	/** The full title, usually from pageTitle(). */
	title: string;
	description?: string;
	/** The canonical path, e.g. "/discover/horror". */
	path?: string;
	image?: SeoImage;
	type?: string;
	noindex?: boolean;
	/** Structured data for the page, rendered as JSON-LD. */
	jsonLd?: Record<string, unknown>;
	twitterCard?: "summary" | "summary_large_image";
}) {
	const preview = image ?? defaultOgImage();
	const url = path && !noindex ? absoluteUrl(path) : undefined;

	return {
		meta: [
			...seo({
				title,
				description,
				url,
				type,
				siteName: SITE_CONFIG.name,
				image: preview.url,
				imageAlt: preview.alt,
				imageWidth: preview.width,
				imageHeight: preview.height,
				noindex,
				twitterCard,
			}),
		],
		links: url ? [{ rel: "canonical", href: url }] : [],
		scripts: jsonLd
			? [{ type: "application/ld+json", children: toJsonLd(jsonLd) }]
			: [],
	};
}

export function truncateForMeta(
	text: string | undefined,
	maxLength = 115,
): string | undefined {
	if (!text) return undefined;
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function truncateTitle(text: string, maxLength = 40): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Structured data for the home page: the site with its search box, and the
 * app itself, so search results can show a sitelinks search box and know
 * Watchlist is a free web app.
 */
export function siteJsonLd() {
	const url = absoluteUrl("/");
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": `${url}#website`,
				name: SITE_CONFIG.name,
				url,
				description: SITE_CONFIG.description,
				inLanguage: "en",
				potentialAction: {
					"@type": "SearchAction",
					target: {
						"@type": "EntryPoint",
						urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
					},
					"query-input": "required name=search_term_string",
				},
			},
			{
				"@type": "WebApplication",
				name: SITE_CONFIG.name,
				url: absoluteUrl("/discover"),
				description: SITE_CONFIG.description,
				applicationCategory: "EntertainmentApplication",
				operatingSystem: "Any",
				browserRequirements: "Requires JavaScript",
				image: absoluteUrl(SITE_CONFIG.ogImage.path),
				offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
			},
		],
	};
}
