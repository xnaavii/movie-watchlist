import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import { Item, ItemContent, ItemTitle } from "#/components/ui/item";
import { movieQueries } from "../queries";

const routeApi = getRouteApi("/_app/discover");

export function GenresCarousel() {
	const { genreId } = routeApi.useSearch();
	const { data: genres } = useSuspenseQuery(movieQueries.genres({}));

	return (
		<Carousel
			opts={{ dragFree: true, align: "start" }}
			plugins={[WheelGesturesPlugin()]}
			className="w-full relative"
		>
			<CarouselContent>
				{genres?.genres.map((genre) => (
					<CarouselItem key={genre.id} className="pl-4 basis-auto">
						<Item
							variant={genre.id === genreId ? "muted" : "default"}
							asChild
							className="w-30 h-20 md:w-40 md:h-30"
						>
							<Link
								to="/discover"
								search={(prev) => ({ ...prev, genreId: genre.id })}
							>
								<ItemContent className="flex-row items-center justify-center gap-4">
									<ItemTitle className={genre.id !== genreId ? "text-muted-foreground" : ""}>
										{genre.name}
									</ItemTitle>
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
