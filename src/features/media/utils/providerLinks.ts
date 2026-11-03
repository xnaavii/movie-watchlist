/**
 * Where a provider logo should take you. TMDB only gives one link per title
 * (its own watch page), so we open a search for the title on the provider's
 * site for the big services we know, and JustWatch for everyone else.
 */
const PROVIDER_SEARCH: Record<number, (query: string) => string> = {};

const register = (ids: number[], toUrl: (query: string) => string) => {
	for (const id of ids) PROVIDER_SEARCH[id] = toUrl;
};

// TMDB provider ids.
register([8, 1796], (q) => `https://www.netflix.com/search?q=${q}`);
register(
	[9, 10, 119, 2100],
	(q) => `https://www.primevideo.com/search?phrase=${q}`,
);
register([2, 350], (q) => `https://tv.apple.com/search?term=${q}`);
register([3], (q) => `https://play.google.com/store/search?q=${q}&c=movies`);
register([192], (q) => `https://www.youtube.com/results?search_query=${q}`);
register([337], (q) => `https://www.disneyplus.com/search?q=${q}`);
register([15], (q) => `https://www.hulu.com/search?q=${q}`);

/** JustWatch uses "uk" rather than the ISO code for the United Kingdom. */
const JUSTWATCH_COUNTRY: Record<string, string> = { GB: "uk" };

export function toJustWatchSearchUrl(title: string, region: string): string {
	const country = JUSTWATCH_COUNTRY[region] ?? region.toLowerCase();
	return `https://www.justwatch.com/${country}/search?q=${encodeURIComponent(title)}`;
}

export function toProviderUrl(
	providerId: number,
	title: string,
	region: string,
): string {
	const search = PROVIDER_SEARCH[providerId];
	return search
		? search(encodeURIComponent(title))
		: toJustWatchSearchUrl(title, region);
}
