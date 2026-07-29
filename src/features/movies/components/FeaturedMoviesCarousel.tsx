import type { MovieResultItem } from "@lorenzopant/tmdb";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import AutoPlay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import { movieQueries } from "../queries";
import { Genres } from "./Genres";
import { MovieLogo } from "./MovieLogo";

const TIMER_INTERVAL = 8000;

interface MoviesCarouselProps {
	movies: MovieResultItem[];
}

export function FeaturedMoviesCarousel({ movies }: MoviesCarouselProps) {
	const [api, setApi] = useState<CarouselApi>();
	const { data: genres } = useQuery(movieQueries.genres({}));

	const autoplayPlugin = useRef(
		AutoPlay({
			delay: TIMER_INTERVAL,
			stopOnInteraction: false,
			stopOnMouseEnter: true,
		}),
	);

	useEffect(() => {
		if (!api) return;

		const onPointerDown = () => {
			autoplayPlugin.current.reset();
		};
		api.on("pointerDown", onPointerDown);
		return () => {
			api.off("pointerDown", onPointerDown);
		};
	}, [api]);

	useEffect(() => {
		if (!api) return;
		api.scrollTo(0);
	}, [api]);

	if (movies.length === 0) {
		return null;
	}

	return (
		<Carousel
			setApi={setApi}
			opts={{ loop: true }}
			plugins={[autoplayPlugin.current, Fade()]}
			className="w-full"
		>
			<CarouselContent>
				{movies.map((movie) => {
					const movieGenres = genres?.genres.filter((genre) =>
						movie.genre_ids.includes(genre.id),
					);

					return (
						<CarouselItem key={movie.id} title={movie.title}>
							<Link
								to="/movies/$id"
								params={{ id: `${movie.id}` }}
								className="group"
							>
								<div className="relative h-[clamp(30vh,60vh+20svh,90vh)] overflow-hidden rounded-xl">
									{movie.backdrop_path ? (
										<img
											src={movie.backdrop_path}
											alt={movie.title}
											className="absolute inset-0 size-full object-cover object-top group-hover:scale-105 transition-all duration-200 "
										/>
									) : movie.poster_path ? (
										<img
											src={movie.poster_path}
											alt={movie.title}
											className="absolute inset-0 size-full object-contain object-top"
										/>
									) : (
										<div className="absolute right-0 bottom-0 size-full bg-muted flex flex-col items-center justify-center">
											<ImageOff />
											<p className="text-xl text-muted-foreground">No Image</p>
										</div>
									)}

									<div className="absolute inset-0 p-4 md:p-6 lg:p-8 flex flex-col gap-6 justify-end bg-linear-to-b from-transparent via-transparent via-30% to-background">
										<div className="flex flex-col gap-6">
											<MovieLogo tmdbId={movie.id} title={movie.title} />
											<p className="text text-sm md:text-base text-muted-foreground line-clamp-2 max-w-xl">
												{movie.overview}
											</p>
											{movieGenres && <Genres genres={movieGenres} />}
										</div>
									</div>

									<div className="pointer-events-none absolute inset-0 rounded-xl inset-ring-2 inset-ring-muted transition-all duration-200 group-hover:inset-ring-foreground group-focus-visible:inset-ring-foreground" />
								</div>
							</Link>
						</CarouselItem>
					);
				})}
			</CarouselContent>
			<CarouselPrevious
				className="absolute left-0 ml-4 md:ml-6 lg:ml-8 translate-y-0"
				variant="secondary"
				size={"icon-lg"}
				onClick={() => {
					api?.scrollPrev();
					autoplayPlugin.current.reset();
				}}
			/>
			<CarouselNext
				className="absolute right-0 mr-4 md:mr-6 lg:mr-8 translate-y-0"
				variant="secondary"
				size={"icon-lg"}
				onClick={() => {
					api?.scrollNext();
					autoplayPlugin.current.reset();
				}}
			/>
		</Carousel>
	);
}
