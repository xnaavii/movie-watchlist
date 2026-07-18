import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { movieQueries } from "#/features/movies/queries";

const routeApi = getRouteApi("/discover");
const ALL_GENRES_VALUE = "all";

export function GenreFilter() {
	const { genreId } = routeApi.useSearch();
	const navigate = routeApi.useNavigate();
	const { data: genres } = useSuspenseQuery(movieQueries.genres({}));

	return (
		<Select
			value={genreId ? String(genreId) : ALL_GENRES_VALUE}
			onValueChange={(value) =>
				navigate({
					search: (prev) => ({
						...prev,
						genreId: value === ALL_GENRES_VALUE ? undefined : Number(value),
					}),
				})
			}
		>
			<SelectTrigger>
				<SelectValue placeholder="Genre" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ALL_GENRES_VALUE}>All Genres</SelectItem>
				{genres.genres.map((genre) => (
					<SelectItem key={genre.id} value={String(genre.id)}>
						{genre.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
