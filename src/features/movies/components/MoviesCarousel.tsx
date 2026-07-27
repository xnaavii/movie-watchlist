import type { MovieResultItem } from "@lorenzopant/tmdb";
import { useQueries } from "@tanstack/react-query";
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

const TIMER_INTERVAL = 8000;

interface MoviesCarouselProps {
	movies: MovieResultItem[];
}

export function MoviesCarousel({ movies }: MoviesCarouselProps) {
	const [api, setApi] = useState<CarouselApi>();
	const imageQueries = useQueries({
		queries: movies.map((movie) => {
			return movieQueries.images({ movie_id: movie.id });
		}),
	});

	const autoplayPlugin = useRef(
		AutoPlay({ delay: TIMER_INTERVAL, stopOnInteraction: false }),
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
				{movies.map((movie, index) => {
					const { data: images, isLoading, isError } = imageQueries[index];

					return (
						<CarouselItem key={movie.id} title={movie.title}>
							<Link to="/movies/$id" params={{ id: `${movie.id}` }}>
								<div className="relative h-[clamp(30vh,60vh+20svh,90vh)] overflow-hidden rounded-xl inset-ring-2 inset-ring-muted">
									{movie.backdrop_path ? (
										<img
											src={movie.backdrop_path}
											alt={movie.title}
											className="absolute inset-0 -z-10 size-full object-cover object-top"
										/>
									) : movie.poster_path ? (
										<img
											src={movie.poster_path}
											alt={movie.title}
											className="absolute inset-0 -z-10 size-full object-contain object-top"
										/>
									) : (
										<div className="absolute right-0 bottom-0 -z-10 size-full bg-muted flex flex-col items-center justify-center">
											<ImageOff />
											<p className="text-xl text-muted-foreground">
												No Backdrop Image
											</p>
										</div>
									)}
									<div className="absolute inset-0 p-4 md:p-6 lg:p-8 flex flex-col gap-6 justify-end bg-linear-to-b from-transparent via-transparent/80 to-background -z-10">
										<div className="flex flex-col gap-4 md:flex-row justify-between md:items-end">
											<div className="flex flex-col gap-4">
												{!isLoading && !isError && images?.logos?.[0] ? (
													<div className="relative inline-block self-start">
														<div className="absolute inset-0 bg-foreground/10 blur-2xl rounded-full scale-150" />
														<img
															src={`https://image.tmdb.org/t/p/original${images.logos[0].file_path}`}
															alt={movie.title}
															className="relative w-auto object-contain"
														/>
													</div>
												) : (
													<h1 className="font-semibold text-4xl md:text-5xl min-w-0">
														{movie.title}
													</h1>
												)}
												<p className="text text-sm md:text-base text-muted-foreground line-clamp-2 max-w-xl">
													{movie.overview}
												</p>
											</div>
										</div>
									</div>
								</div>
							</Link>
						</CarouselItem>
					);
				})}
			</CarouselContent>
			<CarouselPrevious
				className="absolute left-0 ml-8 translate-y-0"
				variant="secondary"
				size={"icon-lg"}
				onClick={() => {
					api?.scrollPrev();
					autoplayPlugin.current.reset();
				}}
			/>
			<CarouselNext
				className="absolute right-0 mr-8 translate-y-0"
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
