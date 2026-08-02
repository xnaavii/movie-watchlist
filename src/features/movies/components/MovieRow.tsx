import type { MovieResultItem } from "@lorenzopant/tmdb";
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
import { MovieCard } from "./MovieCard";
import { RankBadge } from "./RankBadge";

interface MovieRowProps {
	movies: MovieResultItem[];
	watchlistStatuses?: Record<number, WatchlistStatus>;
	showRanks?: boolean;
}

export function MovieRow({
	movies,
	watchlistStatuses,
	showRanks,
}: MovieRowProps) {
	if (movies.length === 0) return null;

	return (
		<Carousel
			opts={{ align: "start", dragFree: true }}
			plugins={[WheelGesturesPlugin()]}
		>
			<CarouselContent className="-ml-4">
				{movies.map((movie, index) => (
					<CarouselItem
						key={movie.id}
						className={cn(
							"pl-4",
							showRanks
								? "basis-2/3 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
								: "basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5",
						)}
					>
						<div className="flex items-center">
							{showRanks && <RankBadge rank={index + 1} className="z-0" />}
							<MovieCard
								id={movie.id}
								title={movie.title}
								posterPath={movie.poster_path ?? null}
								releaseDate={movie.release_date ?? null}
								watchlistStatus={watchlistStatuses?.[movie.id]}
								className="relative z-10"
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
