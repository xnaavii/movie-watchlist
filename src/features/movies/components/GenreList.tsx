import type { Genre } from "@lorenzopant/tmdb";
import { getRouteApi, Link } from "@tanstack/react-router";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { X } from "lucide-react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "#/components/ui/carousel";
import { Item, ItemContent, ItemTitle } from "#/components/ui/item";

interface GenreListProps {
	genres: Genre[];
}

const routeApi = getRouteApi("/discover");

export function GenreList({ genres }: GenreListProps) {
	const { genreId } = routeApi.useSearch();

	const selectedGenre = genres?.find((genre) => genre.id === genreId);
	const visibleGenres = selectedGenre ? [selectedGenre] : genres;

	return (
		<Carousel
			opts={{ dragFree: true, align: "start" }}
			plugins={[WheelGesturesPlugin()]}
			className="w-full"
		>
			<CarouselContent className="-ml-2.5">
				{visibleGenres?.map((genre) => (
					<CarouselItem key={genre.id} className="pl-2.5 basis-auto">
						<Item variant="muted" asChild className="w-fit">
							<Link
								to="/discover"
								search={{
									genreId: genreId === genre.id ? undefined : genre.id,
								}}
								preload="intent"
							>
								<ItemContent className="flex-row items-center gap-1.5">
									<ItemTitle>{genre.name}</ItemTitle>
									{genreId === genre.id && <X className="size-3.5" />}
								</ItemContent>
							</Link>
						</Item>
					</CarouselItem>
				))}
			</CarouselContent>
		</Carousel>
	);
}
