import { useSuspenseQuery } from "@tanstack/react-query";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import { movieQueries } from "../queries";
import { MovieCard } from "./MovieCard";

interface RecommendedMoviesProps {
	tmdbId: number;
}

export function RecommendedMovies({ tmdbId }: RecommendedMoviesProps) {
	const { data, isError, error } = useSuspenseQuery(
		movieQueries.recommendations({ movie_id: tmdbId }),
	);

	if (isError)
		return (
			<div className="p-2 md:p-6 text-red-500">
				There was an error: {error.message}
			</div>
		);

	const movies = data?.results || [];

	if (movies.length === 0) return null;

	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-2xl tracking-tighter font-medium">Similar movies</h2>
			<Carousel
				opts={{ align: "start", dragFree: true }}
				plugins={[WheelGesturesPlugin()]}
			>
				<CarouselContent className="-ml-2.5">
					{movies.map((movie) => (
						<CarouselItem
							key={movie.id}
							className="pl-2.5 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
						>
							<MovieCard
								id={movie.id}
								title={movie.title}
								posterPath={movie.poster_path ?? null}
							/>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="left-2" />
				<CarouselNext className="right-2" />
			</Carousel>
		</div>
	);
}
