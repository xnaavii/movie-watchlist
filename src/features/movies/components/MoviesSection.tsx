import { useQuery } from "@tanstack/react-query";
import { getMoviesList } from "../server/movies.functions";
import { MovieCard } from "./MovieCard";
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
		<div className="relative flex flex-col gap-4">
			<h2 className="text-2xl tracking-tight font-medium">{title}</h2>
			<div className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory">
				{movies.map((movie) => (
					<div key={movie.id} className="w-37.5 sm:w-50 shrink-0 snap-start hover:z-10">
						<MovieCard
							id={movie.id}
							imageSrc={movie.poster_path}
							title={movie.title}
						/>
					</div>
				))}
			</div>
			<div className="absolute right-0 bottom-0 h-full w-24 bg-linear-to-l from-black via-black/30 to-transparent pointer-events-none" />
		</div>
	);
}
