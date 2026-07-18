import type { Genre } from "@lorenzopant/tmdb";
import { getRouteApi, Link } from "@tanstack/react-router";
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

	return (
		<Carousel opts={{ dragFree: true, align: "start" }} className="w-full">
			<CarouselContent className="-ml-2.5">
				{genres?.map((genre) => (
					<CarouselItem key={genre.id} className="pl-2.5 basis-auto">
						<Item
							variant={genreId === genre.id ? "muted" : "default"}
							asChild
							className="w-fit"
						>
							<Link
								to="/discover"
								search={{ genreId: genre.id }}
								preload="intent"
							>
								<ItemContent>
									<ItemTitle>{genre.name}</ItemTitle>
								</ItemContent>
							</Link>
						</Item>
					</CarouselItem>
				))}
			</CarouselContent>
		</Carousel>
	);
}
