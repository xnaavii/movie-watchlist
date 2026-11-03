/**
 * Where a provider logo should take you. TMDB only gives one link per title
 * (its own watch page), so each provider opens its own site for the region
 * being shown: a search for the title where we know the search URL, its
 * home page otherwise. JustWatch is the last resort for providers we don't
 * know at all.
 */
type ProviderUrl = (query: string, region: string) => string;

/** Country codes as each site spells them (most use ISO, some say "uk"). */
const lower = (region: string) => region.toLowerCase();
const ukStyle = (region: string) => (region === "GB" ? "uk" : lower(region));

const PRIME: ProviderUrl = (q) =>
	`https://www.primevideo.com/search?phrase=${q}`;
const APPLE: ProviderUrl = (q, region) =>
	`https://tv.apple.com/${lower(region)}/search?term=${q}`;

/** Keyed by TMDB provider id. */
const PROVIDERS: Record<number, ProviderUrl> = {
	8: (q) => `https://www.netflix.com/search?q=${q}`, // Netflix
	1796: (q) => `https://www.netflix.com/search?q=${q}`, // Netflix with ads
	9: PRIME, // Amazon Prime Video
	119: PRIME, // Amazon Prime Video
	10: PRIME, // Amazon Video (rent/buy)
	2100: PRIME, // Prime Video with ads
	2: APPLE, // Apple TV store
	350: APPLE, // Apple TV+
	3: (q, region) =>
		`https://play.google.com/store/search?q=${q}&c=movies&gl=${region}`, // Google Play
	192: (q) => `https://www.youtube.com/results?search_query=${q}`, // YouTube
	337: (q) => `https://www.disneyplus.com/search?q=${q}`, // Disney+
	15: (q) => `https://www.hulu.com/search?q=${q}`, // Hulu
	38: (q) => `https://www.bbc.co.uk/iplayer/search?q=${q}`, // BBC iPlayer
	283: (q) => `https://www.crunchyroll.com/search?q=${q}`, // Crunchyroll
	130: () => "https://www.skystore.com", // Sky Store
	39: (_, region) => `https://www.nowtv.com/${region === "IE" ? "ie" : ""}`, // NOW
	591: (_, region) => `https://www.nowtv.com/${region === "IE" ? "ie" : ""}`, // NOW Cinema
	35: (_, region) => `https://www.rakuten.tv/${ukStyle(region)}`, // Rakuten TV
	1899: () => "https://www.hbomax.com", // HBO Max
	384: () => "https://www.hbomax.com", // HBO Max (old id)
	531: () => "https://www.paramountplus.com", // Paramount+
	386: () => "https://www.peacocktv.com", // Peacock
	387: () => "https://www.peacocktv.com", // Peacock Premium
	11: () => "https://mubi.com", // MUBI
	41: () => "https://www.itv.com", // ITVX
	103: () => "https://www.channel4.com", // Channel 4
	68: () => "https://www.microsoft.com/store/movies-and-tv", // Microsoft Store
	73: () => "https://tubitv.com", // Tubi
	300: () => "https://pluto.tv", // Pluto TV
	538: () => "https://watch.plex.tv", // Plex
};

export function toJustWatchSearchUrl(title: string, region: string): string {
	return `https://www.justwatch.com/${ukStyle(region)}/search?q=${encodeURIComponent(title)}`;
}

export function toProviderUrl(
	provider: { provider_id: number; provider_name: string },
	title: string,
	region: string,
): string {
	const query = encodeURIComponent(title);
	const known = PROVIDERS[provider.provider_id];
	if (known) return known(query, region);

	// Channels sold through Prime Video or Apple TV ("MGM+ Amazon Channel").
	if (/amazon channel/i.test(provider.provider_name)) {
		return PRIME(query, region);
	}
	if (/apple tv channel/i.test(provider.provider_name)) {
		return APPLE(query, region);
	}
	return toJustWatchSearchUrl(title, region);
}
