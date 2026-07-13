import type { MovieResultItem } from "@lorenzopant/tmdb";
import { Link } from "@tanstack/react-router";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { cn } from "#/lib/utils";

type MovieCardProps = {
	movie: MovieResultItem;
	className?: string;
};

export function MovieCard({ movie, className }: MovieCardProps) {
	return (
		<Card className={cn("mx-auto w-full max-w-sm pt-0", className)}>
			<AspectRatio ratio={2 / 3}>
				<Link
					to="/movies/$id"
					params={{ id: `${movie.id}` }}
					className="block size-full"
				>
					{movie.poster_path ? (
						<img
							src={movie.poster_path}
							alt={movie.title}
							className="size-full object-cover"
							loading="lazy"
						/>
					) : (
						<div className="bg-muted size-full flex items-center justify-center text-xs text-muted-foreground">
							No image
						</div>
					)}
				</Link>
			</AspectRatio>
			<CardHeader>
				<CardTitle className="line-clamp-1">{movie.title}</CardTitle>
				<CardDescription>
					{new Date(movie.release_date).getFullYear() || "N/A"}
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
