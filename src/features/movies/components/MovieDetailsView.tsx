import type { MovieDetails } from "@lorenzopant/tmdb";
import { Genres } from "./Genres";
import { IMDBRatingView } from "./IMDBRatingView";
import { MovieCreditsView } from "./MovieCreditsView";
import { MovieOverview } from "./MovieOverview";

export function MovieDetailsView({ movie }: { movie: MovieDetails }) {
	return (
		<div className="flex flex-col gap-2 text-sm md:text-base max-w-[65ch]">
			<h1 className="font-medium tracking-tighter text-3xl md:text-4xl">
				{movie.title}
			</h1>
			<p className="text-muted-foreground">
				{new Date(movie.release_date).getFullYear()}
			</p>
			<Genres genres={movie.genres} />
			{movie.overview && <MovieOverview overview={movie.overview} />}
			<IMDBRatingView imdbId={movie.imdb_id} />
			<MovieCreditsView movieId={movie.id} />
		</div>
	);
}
