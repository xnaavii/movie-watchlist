export const seo = ({
	title,
	description,
	keywords,
	image,
	imageAlt,
	url,
	type = "website",
	siteName,
	twitterCard = "summary_large_image",
}: {
	title: string;
	description?: string;
	image?: string;
	imageAlt?: string;
	keywords?: string;
	url?: string;
	type?: string;
	siteName?: string;
	twitterCard?: "summary" | "summary_large_image";
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
		...(image && imageAlt
			? [
					{ name: "twitter:image:alt", content: imageAlt },
					{ property: "og:image:alt", content: imageAlt },
				]
			: []),
	];

	return tags;
};

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
