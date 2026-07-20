import type { MovieResultItem } from "@lorenzopant/tmdb";
import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import AutoPlay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
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

const TIMER_INTERVAL = 5000;

interface MoviesCarouselProps {
	movies: MovieResultItem[];
}

export function MoviesCarousel({ movies }: MoviesCarouselProps) {
	const [api, setApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(0);
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

		const onSelect = () => setCurrentIndex(api.selectedScrollSnap());
		const onPointerDown = () => {
			autoplayPlugin.current.reset();
		};
		api.on("select", onSelect);
		api.on("pointerDown", onPointerDown);
		return () => {
			api.off("select", onSelect);
			api.off("pointerDown", onPointerDown);
		};
	}, [api]);

	useEffect(() => {
		if (!api) return;
		api.scrollTo(0);
		setCurrentIndex(0);
	}, [api]);

	const movie = movies[currentIndex];

	if (movies.length === 0) {
		return null;
	}

	return (
		<>
			{movie.backdrop_path && (
				<div className="fixed inset-0 -z-10 overflow-hidden">
					<img
						src={movie.backdrop_path}
						alt=""
						aria-hidden="true"
						className="size-full object-cover blur-3xl"
					/>
					<div className="absolute inset-0 bg-linear-to-b from-transparent to-background/60" />
				</div>
			)}

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
									<div className="relative h-[clamp(30vh,60vh+10svh,90vh)] overflow-hidden rounded-4xl">
										{movie.backdrop_path ? (
											<img
												src={movie.backdrop_path}
												alt={movie.title}
												className="absolute inset-0 size-full object-cover"
											/>
										) : (
											<p>No Image</p>
										)}
										<div className="absolute inset-0 p-4 md:p-10 flex flex-col gap-6 justify-end bg-linear-to-b from-transparent to-background">
											<div className="flex flex-col gap-4 md:flex-row justify-between md:items-end">
												<div className="flex flex-col gap-4 max-w-5xl">
													{!isLoading && !isError && images?.logos?.[0] ? (
														<div className="relative inline-block self-start">
															<div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-150" />
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
				<div className="flex justify-end gap-2 mt-4">
					<CarouselPrevious
						className="static translate-y-0"
						variant="secondary"
						onClick={() => {
							api?.scrollPrev();
							autoplayPlugin.current.reset();
						}}
					/>
					<CarouselNext
						className="static translate-y-0"
						variant="secondary"
						onClick={() => {
							api?.scrollNext();
							autoplayPlugin.current.reset();
						}}
					/>
				</div>
			</Carousel>
		</>
	);
}
