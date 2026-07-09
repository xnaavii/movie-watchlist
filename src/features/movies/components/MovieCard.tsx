import { Link } from "@tanstack/react-router";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Card, CardHeader, CardTitle } from "#/components/ui/card";
import { cn } from "#/lib/utils";
import { getMovieImage } from "../utils/tmdb";

type MovieCardProps = {
	id: number;
	title: string;
	imageSrc: string | null;
	className?: string;
};

export function MovieCard({ id, title, imageSrc, className }: MovieCardProps) {
	const posterImage = getMovieImage(imageSrc, "w342");

	return (
		<Card className={cn("relative mx-auto w-full max-w-sm pt-0", className)}>
			<AspectRatio ratio={2 / 3}>
				<Link
					to="/movies/$id"
					params={{ id: `${id}` }}
					className="block size-full"
				>
					{posterImage ? (
						<img
							src={posterImage}
							alt={title}
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
				<CardTitle className="line-clamp-1">{title}</CardTitle>
			</CardHeader>
		</Card>
	);
}
