import type { WatchProvider, WatchProviderItem } from "@lorenzopant/tmdb";

export const WATCH_REGIONS = ["IE", "GB", "US"] as const;

export type WatchOption = WatchProviderItem & {
	kind: "stream" | "free" | "rent" | "buy";
};

export type WhereToWatch = {
	region: string;
	link: string;
	options: WatchOption[];
};

/**
 * Picks the first region with any providers and flattens it into one list,
 * streaming first, keeping each provider once at its cheapest way to watch.
 */
export function pickWhereToWatch(
	results: Record<string, WatchProvider | undefined>,
	regions: readonly string[] = WATCH_REGIONS,
): WhereToWatch | null {
	for (const region of regions) {
		const providers = results[region];
		if (!providers) continue;

		const groups: [WatchOption["kind"], WatchProviderItem[] | undefined][] = [
			["stream", providers.flatrate],
			["free", [...(providers.free ?? []), ...(providers.ads ?? [])]],
			["rent", providers.rent],
			["buy", providers.buy],
		];

		const seen = new Set<number>();
		const options: WatchOption[] = [];
		for (const [kind, items] of groups) {
			const sorted = [...(items ?? [])].sort(
				(a, b) => a.display_priority - b.display_priority,
			);
			for (const item of sorted) {
				if (seen.has(item.provider_id)) continue;
				seen.add(item.provider_id);
				options.push({ ...item, kind });
			}
		}

		if (options.length > 0) {
			return { region, link: providers.link, options };
		}
	}

	return null;
}
