import type { Genre } from "@lorenzopant/tmdb";
import { Link } from "@tanstack/react-router";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import { Item, ItemContent, ItemTitle } from "#/components/ui/item";

interface GenreRowProps {
	genres: Genre[];
}

export function GenreRow({ genres }: GenreRowProps) {
	return (
		<Carousel
			opts={{ dragFree: true, align: "start" }}
			plugins={[WheelGesturesPlugin()]}
			className="w-full relative"
		>
			<CarouselContent>
				{genres?.map((genre) => (
					<CarouselItem key={genre.id} className="pl-4 basis-auto">
						<Item asChild className="w-30 h-20 md:w-40 md:h-30" variant="muted">
							<Link to="/discover/$genreId" params={{ genreId: genre.id }}>
								<ItemContent className="flex-row items-center justify-center gap-4">
									<ItemTitle>{genre.name}</ItemTitle>
								</ItemContent>
							</Link>
						</Item>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="absolute left-0 ml-2" />
			<CarouselNext className="absolute right-0 mr-2" />
		</Carousel>
	);
}
