import type { Genre } from "@lorenzopant/tmdb";
import AutoPlay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { ImageOff, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import { AddToWatchlistButton } from "#/features/watchlist/components/AddToWatchlistButton";
import { WatchlistBadge } from "#/features/watchlist/components/WatchlistBadge";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import type { MediaItem } from "../types";
import { mediaKey } from "../utils";
import { Genres } from "./Genres";
import { MediaLink } from "./MediaLink";
import { MediaLogo } from "./MediaLogo";

const TIMER_INTERVAL = 8000;

interface MediaCarouselProps {
	items: MediaItem[];
	logos?: Record<string, string | undefined>;
	genres?: Genre[];
	watchlistStatuses?: Record<string, WatchlistStatus>;
}

export function FeaturedMediaCarousel({
	items,
	logos,
	genres,
	watchlistStatuses,
}: MediaCarouselProps) {
	const [api, setApi] = useState<CarouselApi>();
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

	if (items.length === 0) {
		return null;
	}

	return (
		<Carousel
			setApi={setApi}
			opts={{ align: "center", loop: true }}
			plugins={[autoplayPlugin.current, Fade()]}
			className="w-full"
		>
			<CarouselContent>
				{items.map((movie) => {
					const key = mediaKey(movie);
					const movieGenres = genres?.filter((genre) =>
						movie.genreIds?.includes(genre.id),
					);
					const watchlistStatus = watchlistStatuses?.[key] ?? null;

					return (
						<CarouselItem key={key} title={movie.title}>
							<div className="group relative h-[clamp(30vh,60vh+20svh,90vh)] overflow-hidden rounded-xl">
								<MediaLink media={movie} className="absolute inset-0">
									<span className="sr-only">View {movie.title}</span>
								</MediaLink>

								{movie.backdropPath ? (
									<img
										src={movie.backdropPath}
										alt={movie.title}
										className="pointer-events-none absolute inset-0 size-full object-cover object-top transition-all duration-200 group-hover:scale-105"
									/>
								) : movie.posterPath ? (
									<img
										src={movie.posterPath}
										alt={movie.title}
										className="pointer-events-none absolute inset-0 size-full object-contain object-top"
									/>
								) : (
									<div className="pointer-events-none absolute right-0 bottom-0 size-full bg-muted flex flex-col items-center justify-center">
										<ImageOff />
										<p className="text-xl text-muted-foreground">No Image</p>
									</div>
								)}

								<div className="pointer-events-none absolute bottom-0 size-full p-4 md:p-6 lg:p-8 z-10">
									<div className="flex flex-col justify-between gap-6 h-full">
										<div className="flex justify-between">
											<MediaLogo logoSrc={logos?.[key]} title={movie.title} />
											{watchlistStatus && (
												<WatchlistBadge status={watchlistStatus} />
											)}
										</div>
										<div className="flex flex-col gap-2 text-sm md:text-base max-w-xl">
											<h1 className="font-medium tracking-tighter text-3xl md:text-4xl">
												{movie.title}
											</h1>
											{movie.releaseDate && (
												<p className="text-muted-foreground">
													{movie.releaseDate.slice(0, 4)}
												</p>
											)}
											{movieGenres && <Genres genres={movieGenres} />}
											{movie.overview && (
												<p className="text-sm md:text-base text-muted-foreground line-clamp-2 max-w-xl">
													{movie.overview}
												</p>
											)}
											<div className="pointer-events-auto flex flex-wrap gap-2 pt-2">
												{!watchlistStatus && (
													<AddToWatchlistButton media={movie} showLabel />
												)}
												<Button asChild size="lg" variant="secondary">
													<MediaLink media={movie}>
														Details
														<Info />
													</MediaLink>
												</Button>
											</div>
										</div>
									</div>
								</div>

								<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent via-30% to-background" />
								<div className="pointer-events-none absolute inset-0 rounded-xl inset-ring-2 inset-ring-muted transition-all duration-200 group-hover:inset-ring-foreground group-focus-visible:inset-ring-foreground" />
							</div>
						</CarouselItem>
					);
				})}
			</CarouselContent>
			<CarouselPrevious
				className="absolute left-0 ml-4 md:ml-6 lg:ml-8 translate-y-0"
				size={"icon-lg"}
				onClick={() => {
					api?.scrollPrev();
					autoplayPlugin.current.reset();
				}}
			/>
			<CarouselNext
				className="absolute right-0 mr-4 md:mr-6 lg:mr-8 translate-y-0"
				size={"icon-lg"}
				onClick={() => {
					api?.scrollNext();
					autoplayPlugin.current.reset();
				}}
			/>
		</Carousel>
	);
}
