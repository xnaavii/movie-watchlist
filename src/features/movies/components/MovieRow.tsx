import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import type {
	Movie,
	WatchlistStatus,
} from "#/features/watchlist/server/watchlist.server";
import { cn } from "#/lib/utils";
import { MovieCard } from "./MovieCard";
import { RankBadge } from "./RankBadge";

interface MovieRowProps {
	movies: Movie[];
	watchlistStatuses?: Record<number, WatchlistStatus>;
	showRanks?: boolean;
	variant?: "poster" | "backdrop";
}

export function MovieRow({
	movies,
	watchlistStatuses,
	showRanks,
	variant = "poster",
}: MovieRowProps) {
	if (movies.length === 0) return null;

	const basisClass =
		variant === "backdrop"
			? "basis-full sm:basis md:basis-1/2"
			: "basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/6";

	return (
		<Carousel
			opts={{ align: "start", dragFree: true }}
			plugins={[WheelGesturesPlugin()]}
		>
			<CarouselContent className="-ml-4">
				{movies.map((movie, index) => (
					<CarouselItem key={movie.id} className={cn("pl-4", basisClass)}>
						<div className="flex items-start">
							{showRanks && (
								<div className="shrink-0 flex items-center justify-center self-center z-0 -mr-3 sm:-mr-5">
									<RankBadge rank={index + 1} />
								</div>
							)}
							<MovieCard
								movie={movie}
								variant={variant}
								watchlistStatus={watchlistStatuses?.[movie.id]}
								className="relative z-10 flex-1 min-w-0"
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
