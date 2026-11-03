import type { DiscFormat, DiscReleases } from "../types";
import type { WatchOption, WhereToWatch } from "./watchProviders";

export type BestWayToWatch = {
	/** The quickest, cheapest way to start watching right now. */
	easiest: WatchOption | null;
	/** The best picture and sound we know of. */
	bestQuality: DiscFormat | null;
};

/**
 * Sums up where to watch in two picks. Streaming quality isn't published by
 * TMDB, so "best quality" is only claimed for a 4K disc, or for any disc when
 * there's no digital way to watch at all.
 */
export function pickBestWayToWatch(
	whereToWatch: WhereToWatch | null,
	discs: DiscReleases | null,
): BestWayToWatch | null {
	const easiest = whereToWatch?.options[0] ?? null;
	const bestDisc = discs?.formats[0] ?? null;
	const bestQuality =
		bestDisc === "uhd" || (bestDisc && !easiest) ? bestDisc : null;

	if (!easiest && !bestQuality) return null;
	return { easiest, bestQuality };
}
