import type { MovieDetails } from "@lorenzopant/tmdb";
import { AspectRatio } from "#/components/ui/aspect-ratio";

type PosterProps = {
	movie: MovieDetails;
};

export function Poster({ movie }: PosterProps) {
	return (
		<div className="relative w-full max-w-60 rounded-4xl z-10">
			<AspectRatio ratio={2 / 3}>
				<div className="absolute inset-0 rounded-4xl overflow-hidden shadow-2xl">
					<img
						src={movie.poster_path}
						alt={`${movie.title} poster`}
						className="size-full object-cover"
					/>
				</div>
			</AspectRatio>
		</div>
	);
}
