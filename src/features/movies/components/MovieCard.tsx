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
	id: number | string;
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	className?: string;
};

export function MovieCard({
	id,
	title,
	posterPath,
	releaseDate,
	className,
}: MovieCardProps) {
	return (
		<Card className={cn("mx-auto w-full max-w-sm pt-0", className)}>
			<AspectRatio ratio={2 / 3}>
				<Link
					to="/movies/$id"
					params={{ id: `${id}` }}
					className="block size-full"
				>
					{posterPath ? (
						<img
							src={posterPath}
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
				<CardDescription>
					{releaseDate ? new Date(releaseDate).getFullYear() : "N/A"}
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
