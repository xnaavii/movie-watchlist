import { useQuery } from "@tanstack/react-query";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { movieQueries } from "../queries";
import { toTmdbImageUrl } from "../utils/tmdb";

const MAX_IMAGES = 12;

interface MovieGalleryViewProps {
	movieId: number;
	movieTitle: string;
}

export function MovieGalleryView({
	movieId,
	movieTitle,
}: MovieGalleryViewProps) {
	const { data: stills } = useQuery({
		...movieQueries.gallery({ movie_id: movieId }),
		select: (images) => images.backdrops.slice(0, MAX_IMAGES),
	});

	if (!stills || stills.length < 2) return null;

	return (
		<section className="flex flex-col gap-6">
			<h2 className="text-2xl tracking-tighter">Gallery</h2>
			<Carousel
				opts={{ align: "start", dragFree: true }}
				plugins={[WheelGesturesPlugin()]}
			>
				<CarouselContent className="-ml-4">
					{stills.map((still, index) => (
						<CarouselItem
							key={still.file_path}
							className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3"
						>
							<Dialog>
								<DialogTrigger asChild>
									<button
										type="button"
										className="group block w-full rounded-3xl overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
									>
										<AspectRatio ratio={16 / 9}>
											<img
												src={toTmdbImageUrl(still.file_path, "w780")}
												alt={`${movieTitle} still ${index + 1}`}
												className="size-full object-cover transition-all duration-200 group-hover:scale-105"
												loading="lazy"
											/>
										</AspectRatio>
									</button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-5xl p-2 overflow-hidden">
									<DialogTitle className="sr-only">
										{movieTitle} still {index + 1}
									</DialogTitle>
									<img
										src={toTmdbImageUrl(still.file_path, "w1280")}
										alt={`${movieTitle} still ${index + 1}`}
										className="w-full rounded-lg"
									/>
								</DialogContent>
							</Dialog>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="absolute left-0 ml-2" />
				<CarouselNext className="absolute right-0 mr-2" />
			</Carousel>
		</section>
	);
}
