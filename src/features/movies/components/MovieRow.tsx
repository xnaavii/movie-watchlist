import type { MovieResultItem } from "@lorenzopant/tmdb";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import { MovieCard } from "./MovieCard";

interface MovieRowProps {
	movies: MovieResultItem[];
	watchlistStatuses?: Record<number, "want_to_watch" | "watched" | null>;
}

export function MovieRow({ movies, watchlistStatuses }: MovieRowProps) {
	if (movies.length === 0) return null;

	return (
		<Carousel
			opts={{ align: "start", dragFree: true }}
			plugins={[WheelGesturesPlugin()]}
		>
			<CarouselContent className="-ml-4">
				{movies.map((movie) => (
					<CarouselItem
						key={movie.id}
						className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
					>
						<MovieCard
							id={movie.id}
							title={movie.title}
							posterPath={movie.poster_path ?? null}
							releaseDate={movie.release_date ?? null}
							watchlistStatus={watchlistStatuses?.[movie.id] ?? null}
						/>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="left-2" />
			<CarouselNext className="right-2" />
		</Carousel>
	);
}
