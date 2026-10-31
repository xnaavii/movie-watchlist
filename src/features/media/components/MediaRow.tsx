import type { ReactNode } from "react";
import { RowCarousel } from "#/components/RowCarousel";
import { CarouselItem } from "#/components/ui/carousel";
import type { WatchlistStatus } from "#/features/watchlist/types";
import { cn } from "#/lib/utils";
import type { MediaItem } from "../types";
import { mediaKey } from "../utils";
import { MediaCard } from "./MediaCard";
import { RankBadge } from "./RankBadge";

interface MediaRowProps {
	items: MediaItem[];
	/** Title area; the scroll arrows sit to its right. */
	header?: ReactNode;
	logos?: Record<string, string | undefined>;
	watchlistStatuses?: Record<string, WatchlistStatus>;
	showRanks?: boolean;
	variant?: "poster" | "backdrop";
}

// Fractions a little under 1/n, so part of the next card always peeks in.
const BASIS = {
	poster: "basis-[38%] sm:basis-[28%] lg:basis-[21%] xl:basis-[17.5%]",
	backdrop: "basis-[85%] md:basis-[46%] xl:basis-[38%]",
};

export function MediaRow({
	items,
	header,
	logos,
	watchlistStatuses,
	showRanks,
	variant = "poster",
}: MediaRowProps) {
	if (items.length === 0) return null;

	return (
		<RowCarousel header={header}>
			{items.map((item, index) => (
				<CarouselItem
					key={mediaKey(item)}
					className={cn("pl-4", BASIS[variant])}
				>
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
		</RowCarousel>
	);
}
