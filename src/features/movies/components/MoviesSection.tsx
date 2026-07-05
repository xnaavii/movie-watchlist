import { useQuery } from "@tanstack/react-query";
import { getMoviesList } from "../server/movies.functions";
import { MovieList } from "./MovieList";
import { MoviesSectionSkeleton } from "./MoviesSectionSkeleton";

type MovieListType = "popular" | "now_playing" | "top_rated" | "upcoming";

type MoviesSectionProps = {
	title: string;
	list: MovieListType;
	language?: string;
	page?: number;
};

export function MoviesSection({
	title,
	list,
	language = "en-US",
	page = 1,
}: MoviesSectionProps) {
	const { isPending, error, data } = useQuery({
		queryKey: ["movies", list, language, page],
		queryFn: () => getMoviesList({ data: { list, language, page } }),
	});

	if (isPending) {
		return <MoviesSectionSkeleton />;
	}

	if (error)
		return <div className="p-4 text-red-500">Error loading {title}</div>;

	const movies = data?.success ? data.data.results : [];

	if (movies.length === 0) return null;

	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-2xl tracking-tight font-medium">{title}</h2>
			<MovieList movies={movies} />
		</div>
	);
}
