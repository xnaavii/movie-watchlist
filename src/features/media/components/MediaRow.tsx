import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { cn } from "#/lib/utils";
import type { MediaItem } from "../types";
import { mediaKey } from "../utils";
import { MediaCard } from "./MediaCard";
import { RankBadge } from "./RankBadge";

interface MediaRowProps {
	items: MediaItem[];
	logos?: Record<string, string | undefined>;
	watchlistStatuses?: Record<string, WatchlistStatus>;
	showRanks?: boolean;
	variant?: "poster" | "backdrop";
}

export function MediaRow({
	items,
	logos,
	watchlistStatuses,
	showRanks,
	variant = "poster",
}: MediaRowProps) {
	if (items.length === 0) return null;

	const basisClass =
		variant === "backdrop"
			? "basis-full sm:basis md:basis-1/2"
			: "basis-1/3 sm:basis-1/4 lg:basis-1/5 xl:basis-1/6";

	return (
		<Carousel
			opts={{ align: "start", dragFree: true }}
			plugins={[WheelGesturesPlugin()]}
		>
			<CarouselContent className="-ml-4">
				{items.map((item, index) => (
					<CarouselItem key={mediaKey(item)} className={cn("pl-4", basisClass)}>
						<div className="flex items-start">
							{showRanks && (
								<div className="shrink-0 flex items-center justify-center z-0">
									<RankBadge rank={index + 1} />
								</div>
							)}
							<MediaCard
								media={item}
								variant={variant}
								watchlistStatus={watchlistStatuses?.[mediaKey(item)]}
								className="relative z-10 flex-1 min-w-0"
								logoSrc={logos?.[mediaKey(item)]}
							/>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="left-2" />
			<CarouselNext className="right-2" />
		</Carousel>
	);
}
