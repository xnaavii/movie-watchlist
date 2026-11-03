import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { mediaQueries } from "../queries";
import type { MediaDetails } from "../types";
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
	media: Pick<MediaDetails, "mediaType" | "id" | "title" | "discReleases">;
	/** Watching-at-home extras shown under the providers, like the Atmos prompt. */
	children?: ReactNode;
}

/**
 * "Best way to watch": the headline picks, every streaming, rent and buy
 * option (JustWatch via TMDB), and disc releases (TMDB, movies only).
 */
export function MediaWhereToWatchView({
	media,
	children,
}: MediaWhereToWatchViewProps) {
	const { data: whereToWatch, isLoading } = useQuery({
		...mediaQueries.watchProviders(media),
		select: (data) => pickWhereToWatch(data.results),
	});

	if (isLoading) {
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
				{children}
			</section>
		);
	}

	const discs = media.discReleases ?? null;
	const picks = pickBestWayToWatch(whereToWatch ?? null, discs);
	if (!whereToWatch && !discs && !children) return null;

	const discLink = toBlurayComSearchUrl(media.title);
	const today = new Date().toISOString().slice(0, 10);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl tracking-tighter">Best way to watch</h2>
				{whereToWatch && (
					<p className="text-sm text-muted-foreground">
						Streaming in {formatRegion(whereToWatch.region)}, powered by
						JustWatch
					</p>
				)}
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
			{children && (
				<div className="flex flex-col gap-3 max-w-3xl">
					<h3 className="text-sm font-medium text-muted-foreground">Sound</h3>
					{children}
				</div>
			)}
		</section>
	);
}
