export const seo = ({
	title,
	description,
	keywords,
	image,
	url,
}: {
	title: string;
	description?: string;
	image?: string;
	keywords?: string;
	url?: string;
}) => {
	const tags = [
		{ title },
		{ name: "description", content: description },
		{ name: "keywords", content: keywords },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		...(url
			? [
					{ property: "og:url", content: url },
					{ name: "twitter:url", content: url },
				]
			: []),
		...(image
			? [
					{ name: "twitter:image", content: image },
					{ name: "twitter:card", content: "summary_large_image" },
					{ property: "og:image", content: image },
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
