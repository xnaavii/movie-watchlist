import type { Genre } from "@lorenzopant/tmdb";
import { getRouteApi, Link } from "@tanstack/react-router";
import { Item, ItemContent, ItemGroup, ItemTitle } from "#/components/ui/item";

interface GenreListProps {
	genres: Genre[];
}

const routeApi = getRouteApi("/discover");

export function GenreList({ genres }: GenreListProps) {
	const { genreId } = routeApi.useSearch();

	return (
		<ItemGroup className="flex flex-row items-center gap-2.5 overflow-x-auto scrollbar-none">
			{genres?.map((genre) => (
				<Item
					key={genre.id}
					variant={genreId === genre.id ? "muted" : "default"}
					asChild
					className="w-fit"
				>
					<Link
						to="/discover"
						search={{ genreId: genre.id }}
						className="shrink-0"
						resetScroll={false}
						preload="intent"
					>
						<ItemContent>
							<ItemTitle>{genre.name}</ItemTitle>
						</ItemContent>
					</Link>
				</Item>
			))}
		</ItemGroup>
	);
}
