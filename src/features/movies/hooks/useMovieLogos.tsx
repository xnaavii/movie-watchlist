import { useQueries } from "@tanstack/react-query";
import { movieQueries } from "#/features/movies/queries";
import { buildLogoMap } from "../utils";

export function useMovieLogos(movies: { id: number }[]) {
	const results = useQueries({
		queries: movies.map((movie) => movieQueries.images({ movie_id: movie.id })),
	});
	return buildLogoMap(movies, results);
}
