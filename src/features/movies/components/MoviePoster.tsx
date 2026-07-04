import { AspectRatio } from "#/components/ui/aspect-ratio";
import { getMovieImage } from "#/features/movies/utils/tmdb";

type MoviePosterProps = {
	posterPath: string | null;
	title: string;
	className?: string;
};

export function MoviePoster({
	posterPath,
	title,
	className,
}: MoviePosterProps) {
	const posterImage = getMovieImage(posterPath, "w342");

	return (
		<AspectRatio
			ratio={2 / 3}
			className={`rounded-lg overflow-hidden bg-muted ${className ?? ""}`}
		>
			{posterImage ? (
				<img
					src={posterImage}
					alt={title}
					className="absolute inset-0 size-full object-cover"
				/>
			) : (
				<div className="absolute inset-0 bg-muted flex items-center justify-center text-xl text-muted-foreground">
					No image
				</div>
			)}
		</AspectRatio>
	);
}
