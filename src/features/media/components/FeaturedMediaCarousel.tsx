import type { Genre } from "@lorenzopant/tmdb";
import AutoPlay from "embla-carousel-autoplay";
import { ImageOff, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useReducedMotion } from "#/hooks/useReducedMotion";
import { cn } from "#/lib/utils";
import type { MediaItem } from "../types";
import { mediaKey } from "../utils";
import { Genres } from "./Genres";
import { MediaLink } from "./MediaLink";
import { MediaLogo } from "./MediaLogo";

const TIMER_INTERVAL = 8000;
/** How much smaller a neighbour is than the slide in the middle. */
const SIDE_SCALE = 0.84;
/** How far a neighbour tucks in under the middle slide, as a share of its width. */
const SIDE_TUCK = 0.16;

interface MediaCarouselProps {
	items: MediaItem[];
	logos?: Record<string, string | undefined>;
	genres?: Genre[];
	watchlistStatuses?: Record<string, WatchlistStatus>;
}

/**
 * Signed distance of each slide from the middle, in slides: 0 is the selected
 * one, -1 the neighbour on the left, 1 the one on the right. Follows the drag,
 * so the layering moves with the finger.
 */
function slideOffsets(api: NonNullable<CarouselApi>) {
	const engine = api.internalEngine();
	const progress = api.scrollProgress();
	const snaps = api.scrollSnapList();
	const offsets = new Array<number>(api.slideNodes().length).fill(0);

	snaps.forEach((snap, snapIndex) => {
		for (const slideIndex of engine.slideRegistry[snapIndex] ?? []) {
			let diff = snap - progress;
			if (engine.options.loop) {
				for (const loopItem of engine.slideLooper.loopPoints) {
					const target = loopItem.target();
					if (loopItem.index !== slideIndex || target === 0) continue;
					diff =
						Math.sign(target) === -1
							? snap - (1 + progress)
							: snap + (1 - progress);
				}
			}
			offsets[slideIndex] = diff * snaps.length;
		}
	});
	return offsets;
}

/**
 * The hero on the discover pages: the selected title sits in the middle, with
 * the titles before and after it smaller, dimmer and tucked in underneath on
 * either side. Swipe, the arrows, the arrow keys or the dots move between them.
 */
export function FeaturedMediaCarousel({
	items,
	logos,
	genres,
	watchlistStatuses,
}: MediaCarouselProps) {
	const [api, setApi] = useState<CarouselApi>();
	const [selected, setSelected] = useState(0);
	const reducedMotion = useReducedMotion();
	const autoplayPlugin = useRef(
		AutoPlay({
			delay: TIMER_INTERVAL,
			stopOnInteraction: false,
			stopOnMouseEnter: true,
		}),
	);

	// Moving by hand restarts the timer, so the next slide doesn't arrive
	// straight after you picked one.
	useEffect(() => {
		if (!api) return;
		const reset = () => autoplayPlugin.current.reset();
		api.on("pointerDown", reset);
		return () => {
			api.off("pointerDown", reset);
		};
	}, [api]);

	useEffect(() => {
		if (!api) return;
		if (reducedMotion) autoplayPlugin.current.stop();
		else autoplayPlugin.current.play();
	}, [api, reducedMotion]);

	// Only the middle slide is reachable by Tab; the neighbours are behind it.
	// If focus was inside the slide that just moved aside, it follows to the
	// new middle slide instead of falling back to the page.
	const refocus = useRef(false);
	useEffect(() => {
		if (!api) return;
		const onSelect = () => {
			const active = document.activeElement;
			refocus.current = api
				.slideNodes()
				.some((slide) => active && slide.contains(active));
			setSelected(api.selectedScrollSnap());
		};
		onSelect();
		api.on("select", onSelect);
		api.on("reInit", onSelect);
		return () => {
			api.off("select", onSelect);
			api.off("reInit", onSelect);
		};
	}, [api]);

	useEffect(() => {
		if (!api || !refocus.current) return;
		refocus.current = false;
		api
			.slideNodes()
			[selected]?.querySelector<HTMLElement>("a[href], button")
			?.focus({ preventScroll: true });
	}, [api, selected]);

	// Scale, tuck and dim each slide by how far it is from the middle. Written
	// straight to the DOM on every scroll frame, not through React state.
	useEffect(() => {
		if (!api) return;
		const layer = () => {
			const offsets = slideOffsets(api);
			api.slideNodes().forEach((node, index) => {
				const offset = offsets[index] ?? 0;
				const distance = Math.min(Math.abs(offset), 2);
				const near = Math.min(distance, 1);
				const card = node.firstElementChild as HTMLElement | null;
				node.style.zIndex = String(100 - Math.round(distance * 10));
				if (!card) return;
				const scale = 1 - (1 - SIDE_SCALE) * near;
				const tuck = -Math.sign(offset) * SIDE_TUCK * near * 100;
				card.style.transform = `translateX(${tuck}%) scale(${scale})`;
				// Slides further out than the neighbours fade away behind them.
				card.style.opacity = String(Math.max(0, Math.min(1, 2 - distance)));
				card.style.setProperty("--hero-focus", String(1 - near));
			});
		};
		layer();
		api.on("scroll", layer);
		api.on("reInit", layer);
		api.on("resize", layer);
		return () => {
			api.off("scroll", layer);
			api.off("reInit", layer);
			api.off("resize", layer);
		};
	}, [api]);

	// Tapping a neighbour brings it to the middle.
	useEffect(() => {
		if (!api) return;
		const onSlideClick = (_: NonNullable<CarouselApi>, event: Event) => {
			// Embla swallows the click that ends a drag before it gets here.
			if (event.defaultPrevented) return;
			const index = api
				.slideNodes()
				.findIndex((slide) => slide.contains(event.target as Node));
			if (index !== -1 && index !== api.selectedScrollSnap()) {
				event.preventDefault();
				api.scrollTo(index, reducedMotion);
			}
		};
		const nodes = api.slideNodes();
		const handlers = nodes.map((node) => {
			const handler = (event: Event) => onSlideClick(api, event);
			node.addEventListener("click", handler);
			return handler;
		});
		return () => {
			nodes.forEach((node, i) => {
				const handler = handlers[i];
				if (handler) node.removeEventListener("click", handler);
			});
		};
	}, [api, reducedMotion]);

	const goTo = useCallback(
		(index: number) => {
			api?.scrollTo(index, reducedMotion);
			autoplayPlugin.current.reset();
		},
		[api, reducedMotion],
	);

	if (items.length === 0) {
		return null;
	}

	return (
		<Carousel
			setApi={setApi}
			opts={{
				align: "center",
				loop: items.length > 2,
				duration: reducedMotion ? 1 : 30,
			}}
			plugins={[autoplayPlugin.current]}
			className="flex flex-col gap-4"
		>
			{/* Bleeds through the Container's padding so the neighbours run to
			    the screen edges, like the rows below. The vertical padding
			    leaves room for the focus ring. */}
			<div className="-mx-4 md:-mx-6 lg:-mx-8">
				<CarouselContent className="ml-0 py-1">
					{items.map((media, index) => {
						const key = mediaKey(media);
						const mediaGenres = genres?.filter((genre) =>
							media.genreIds?.includes(genre.id),
						);
						const watchlistStatus = watchlistStatuses?.[key] ?? null;
						const isSelected = index === selected;

						return (
							<CarouselItem
								key={key}
								title={isSelected ? undefined : media.title}
								aria-label={`${index + 1} of ${items.length}: ${media.title}`}
								aria-current={isSelected ? "true" : undefined}
								className={cn(
									"relative basis-[76%] pl-0 sm:basis-[72%] lg:basis-[62%] xl:basis-[58%]",
									!isSelected && "cursor-pointer",
								)}
							>
								<div
									inert={!isSelected}
									className="group relative aspect-[4/5] max-h-[68svh] w-full sm:aspect-[16/11] sm:min-h-[22rem] xl:aspect-video overflow-hidden rounded-xl bg-muted shadow-2xl shadow-black/60 will-change-transform sm:max-h-[78svh]"
								>
									<MediaLink
										media={media}
										className="absolute inset-0 outline-none"
									>
										<span className="sr-only">View {media.title}</span>
									</MediaLink>

									{media.backdropPath ? (
										<img
											src={media.backdropPath}
											alt=""
											loading={index < 2 ? "eager" : "lazy"}
											className="pointer-events-none absolute inset-0 size-full object-cover object-[50%_20%] transition-transform duration-300 motion-safe:group-hover:scale-105"
										/>
									) : media.posterPath ? (
										<img
											src={media.posterPath}
											alt=""
											loading={index < 2 ? "eager" : "lazy"}
											className="pointer-events-none absolute inset-0 size-full object-contain object-top"
										/>
									) : (
										<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-muted">
											<ImageOff />
											<p className="text-xl text-muted-foreground">No Image</p>
										</div>
									)}

									<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent via-25% to-background" />

									<div className="pointer-events-none absolute inset-0 z-10 p-4 opacity-[var(--hero-focus,1)] md:p-6 lg:p-8">
										<div className="flex h-full flex-col justify-between gap-4">
											<div className="flex items-start justify-between gap-4">
												<MediaLogo
													logoSrc={logos?.[key]}
													title={media.title}
													imageClassName="w-[clamp(8rem,14vw,20rem)] max-h-20 md:max-h-28 object-left"
												/>
												{watchlistStatus && (
													<WatchlistBadge status={watchlistStatus} />
												)}
											</div>
											<div className="flex max-w-xl min-w-0 flex-col gap-2 text-sm md:text-base">
												<h2 className="line-clamp-2 text-2xl font-medium tracking-tighter text-balance md:text-4xl">
													{media.title}
												</h2>
												<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
													{media.releaseDate && (
														<span>{media.releaseDate.slice(0, 4)}</span>
													)}
													{mediaGenres && mediaGenres.length > 0 && (
														<Genres
															genres={mediaGenres.slice(0, 3)}
															className="text-foreground"
														/>
													)}
												</div>
												{media.overview && (
													<p className="hidden text-muted-foreground line-clamp-2 sm:block">
														{media.overview}
													</p>
												)}
												<div className="pointer-events-auto flex flex-wrap gap-2 pt-2">
													{!watchlistStatus && (
														<AddToWatchlistButton media={media} showLabel />
													)}
													<Button asChild size="lg" variant="secondary">
														<MediaLink media={media}>
															Details
															<Info />
														</MediaLink>
													</Button>
												</div>
											</div>
										</div>
									</div>

									{/* Neighbours sit in the shade of the middle slide. */}
									<div className="pointer-events-none absolute inset-0 bg-background opacity-[calc((1-var(--hero-focus,1))*0.55)]" />
									<div className="pointer-events-none absolute inset-0 rounded-xl inset-ring-2 inset-ring-muted transition-shadow duration-200 group-hover:inset-ring-foreground group-has-focus-visible:inset-ring-foreground" />
								</div>
							</CarouselItem>
						);
					})}
				</CarouselContent>
			</div>

			{items.length > 1 && (
				<div className="flex items-center justify-center gap-3">
					<CarouselPrevious
						className="static my-0 hidden sm:inline-flex"
						onClick={() => {
							api?.scrollPrev(reducedMotion);
							autoplayPlugin.current.reset();
						}}
					/>
					<fieldset
						aria-label="Choose a slide"
						className="m-0 flex min-w-0 flex-wrap items-center justify-center border-0 p-0"
					>
						{items.map((media, index) => (
							<button
								key={mediaKey(media)}
								type="button"
								aria-label={`Show ${media.title}`}
								aria-current={index === selected ? "true" : undefined}
								onClick={() => goTo(index)}
								className="group/dot flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
							>
								<span
									className={cn(
										"block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
										index === selected
											? "w-5 bg-foreground"
											: "w-1.5 bg-muted-foreground/50 group-hover/dot:bg-foreground",
									)}
								/>
							</button>
						))}
					</fieldset>
					<CarouselNext
						className="static my-0 hidden sm:inline-flex"
						onClick={() => {
							api?.scrollNext(reducedMotion);
							autoplayPlugin.current.reset();
						}}
					/>
				</div>
			)}
		</Carousel>
	);
}
