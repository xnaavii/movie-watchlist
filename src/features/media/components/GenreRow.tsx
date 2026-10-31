import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { RowCarousel } from "#/components/RowCarousel";
import { CarouselItem } from "#/components/ui/carousel";
import { Item, ItemContent, ItemTitle } from "#/components/ui/item";
import type { DiscoverGenre } from "../genres";
import { getGenreIcon } from "../utils/genreIcons";

interface GenreRowProps {
	genres: DiscoverGenre[];
	header?: ReactNode;
}

export function GenreRow({ genres, header }: GenreRowProps) {
	return (
		<RowCarousel header={header}>
			{genres.map((genre) => {
				const Icon = getGenreIcon(genre.slug);

				return (
					<CarouselItem key={genre.slug} className="pl-4 basis-auto">
						<Item asChild className="w-30 h-20 md:w-40 md:h-30" variant="muted">
							<Link
								to="/discover/$genreSlug"
								params={{ genreSlug: genre.slug }}
							>
								<ItemContent className="flex-col items-center justify-center gap-2">
									<Icon className="size-5 md:size-6 text-muted-foreground transition-colors group-hover/item:text-foreground" />
									<ItemTitle className="text-center">{genre.name}</ItemTitle>
								</ItemContent>
							</Link>
						</Item>
					</CarouselItem>
				);
			})}
		</RowCarousel>
	);
}
