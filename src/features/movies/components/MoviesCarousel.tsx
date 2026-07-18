import type { MovieResultItem } from "@lorenzopant/tmdb";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "#/components/ui/carousel";

const TIMER_INTERVAL = 8000;

export function MoviesCarousel({ movies }: { movies: MovieResultItem[] }) {
	const [api, setApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (!api) return;

		const onSelect = () => setCurrentIndex(api.selectedScrollSnap());
		api.on("select", onSelect);
		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	const movie = movies[currentIndex];

	if (movies.length === 0) {
		return null;
	}

	// TODO: Display movie poster on the carousel

	return (
		<>
			{movie.backdrop_path && (
				<div className="fixed inset-0 -z-10 overflow-hidden">
					<img
						src={movie.backdrop_path}
						alt=""
						aria-hidden="true"
						className="size-full object-cover blur-3xl opacity-70"
					/>
					<div className="absolute inset-0 bg-linear-to-b from-transparent via-background/60 to-background" />
				</div>
			)}

			<Carousel
				setApi={setApi}
				opts={{ loop: true }}
				plugins={[
					Autoplay({ delay: TIMER_INTERVAL, stopOnInteraction: false }),
				]}
				className="w-full"
			>
				<CarouselContent>
					{movies.map((movie) => (
						<CarouselItem key={movie.id}>
							<div className="relative h-[clamp(30vh,60vh+10svh,90vh)] overflow-hidden rounded-4xl">
								{movie.backdrop_path ? (
									<img
										src={movie.backdrop_path}
										alt={movie.title}
										className="absolute inset-0 size-full object-cover object-top shadow-2xl"
									/>
								) : (
									<p>No Image</p>
								)}
								<div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
								<div className="absolute inset-0 p-2 md:p-6 flex flex-col gap-6 justify-end">
									<div className="flex flex-col gap-4 md:flex-row justify-between md:items-end">
										<div className="flex flex-col gap-2 max-w-5xl">
											<h1 className="font-medium tracking-tight text-2xl md:text-4xl lg:text-5xl min-w-0">
												{movie.title}
											</h1>
											<p className="text text-sm md:text-base text-muted-foreground line-clamp-2">
												{movie.overview}
											</p>
										</div>

										<Button variant="secondary" className="w-fit" asChild>
											<Link to="/movies/$id" params={{ id: `${movie.id}` }}>
												More Details
											</Link>
										</Button>
									</div>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</>
	);
}
