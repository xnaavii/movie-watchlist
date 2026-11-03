import { useQuery } from "@tanstack/react-query";
import { MEDIA_TYPE_CONFIG } from "../mediaTypes";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { pickBestWayToWatch } from "../utils/bestWayToWatch";
import { toBlurayComSearchUrl } from "../utils/blurayLinks";
import { formatRegion } from "../utils/format";
import { toTmdbImageUrl } from "../utils/tmdb";
import { pickWhereToWatch } from "../utils/watchProviders";
import { BestWayToWatchPicks } from "./BestWayToWatchPicks";
import { DiscReleasesList } from "./DiscReleasesList";

const KIND_LABELS = {
	stream: "Stream",
	free: "Free",
	rent: "Rent",
	buy: "Buy",
} as const;

interface MediaWhereToWatchViewProps {
	media: MediaRef & { title: string };
}

/**
 * "Best way to watch": the headline picks, every streaming, rent and buy
 * option (JustWatch via TMDB), and disc releases (TMDB, movies only).
 */
export function MediaWhereToWatchView({ media }: MediaWhereToWatchViewProps) {
	const ref = { mediaType: media.mediaType, id: media.id };
	const { data: whereToWatch, isLoading } = useQuery({
		...mediaQueries.watchProviders(ref),
		select: (data) => pickWhereToWatch(data.results),
	});
	const { data: discs, isLoading: isLoadingDiscs } = useQuery({
		...mediaQueries.discReleases(ref),
		enabled: MEDIA_TYPE_CONFIG[media.mediaType].hasDiscReleases,
	});

	if (isLoading || isLoadingDiscs) {
		return (
			<section className="flex flex-col gap-6">
				<h2 className="text-2xl tracking-tighter">Best way to watch</h2>
				<div className="flex gap-4">
					{Array.from({ length: 4 }, (_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							key={i}
							className="size-14 md:size-16 rounded-full bg-muted animate-pulse"
						/>
					))}
				</div>
			</section>
		);
	}

	const picks = pickBestWayToWatch(whereToWatch ?? null, discs ?? null);
	if (!picks && !discs) return null;

	const discLink = toBlurayComSearchUrl(media.title);
	const today = new Date().toISOString().slice(0, 10);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl tracking-tighter">Best way to watch</h2>
				<p className="text-sm text-muted-foreground">
					{whereToWatch
						? `Streaming in ${formatRegion(whereToWatch.region)}, powered by JustWatch`
						: "Not streaming in your region yet"}
				</p>
			</div>

			{picks && (
				<BestWayToWatchPicks
					picks={picks}
					watchLink={whereToWatch?.link ?? null}
					discLink={discLink}
				/>
			)}

			{whereToWatch && (
				<ul className="flex flex-wrap gap-4 md:gap-6">
					{whereToWatch.options.map((option) => (
						<li key={option.provider_id}>
							<a
								href={whereToWatch.link}
								target="_blank"
								rel="noopener noreferrer"
								title={`${KIND_LABELS[option.kind]} on ${option.provider_name}`}
								className="group flex flex-col items-center gap-2 w-16 md:w-20 text-center"
							>
								<img
									src={toTmdbImageUrl(option.logo_path, "w154")}
									alt={option.provider_name}
									className="size-14 md:size-16 rounded-full object-cover ring-2 ring-muted transition-all duration-200 group-hover:ring-foreground"
									loading="lazy"
								/>
								<span className="text-xs text-muted-foreground">
									{KIND_LABELS[option.kind]}
								</span>
							</a>
						</li>
					))}
				</ul>
			)}

			{discs && (
				<DiscReleasesList discs={discs} discLink={discLink} today={today} />
			)}
		</section>
	);
}
