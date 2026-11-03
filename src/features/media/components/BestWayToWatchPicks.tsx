import { Disc3 } from "lucide-react";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "#/components/ui/item";
import type { BestWayToWatch } from "../utils/bestWayToWatch";
import { DISC_FORMATS } from "../utils/discReleases";
import { toTmdbImageUrl } from "../utils/tmdb";
import type { WatchOption } from "../utils/watchProviders";

const EASIEST_TITLES: Record<WatchOption["kind"], string> = {
	stream: "Included with",
	free: "Free on",
	rent: "Rent on",
	buy: "Buy on",
};

interface BestWayToWatchPicksProps {
	picks: BestWayToWatch;
	/** JustWatch page for the title in the shown region. */
	watchLink: string | null;
	/** Where to check and buy disc editions. */
	discLink: string;
}

/** The one or two headline answers to "how should I watch this?". */
export function BestWayToWatchPicks({
	picks,
	watchLink,
	discLink,
}: BestWayToWatchPicksProps) {
	const { easiest, bestQuality } = picks;

	return (
		<div className="grid gap-3 md:grid-cols-2 max-w-3xl">
			{easiest && (
				<Item
					asChild
					className="rounded-3xl bg-primary/10 ring-1 ring-primary/30"
				>
					<a
						href={watchLink ?? undefined}
						target="_blank"
						rel="noopener noreferrer"
					>
						<ItemMedia variant="image">
							<img src={toTmdbImageUrl(easiest.logo_path, "w154")} alt="" />
						</ItemMedia>
						<ItemContent>
							<ItemDescription>Easiest way to watch</ItemDescription>
							<ItemTitle className="text-base">
								{EASIEST_TITLES[easiest.kind]} {easiest.provider_name}
							</ItemTitle>
						</ItemContent>
					</a>
				</Item>
			)}
			{bestQuality && (
				<Item asChild variant="outline" className="rounded-3xl">
					<a href={discLink} target="_blank" rel="noopener noreferrer">
						<ItemMedia variant="icon">
							<Disc3 className="size-6" />
						</ItemMedia>
						<ItemContent>
							<ItemDescription>Best picture and sound</ItemDescription>
							<ItemTitle className="text-base">
								{DISC_FORMATS[bestQuality].label}
							</ItemTitle>
							<ItemDescription>
								{DISC_FORMATS[bestQuality].quality}
							</ItemDescription>
						</ItemContent>
					</a>
				</Item>
			)}
		</div>
	);
}
