import { Link } from "@tanstack/react-router";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Card } from "#/components/ui/card";
import { cn } from "#/lib/utils";

type MovieCardProps = {
	id: number | string;
	title: string;
	posterPath: string | null;
	className?: string;
};

export function MovieCard({
	id,
	title,
	posterPath,
	className,
}: MovieCardProps) {
	return (
		<Card
			className={cn("mx-auto w-full max-w-50 md:max-w-70 py-0", className)}
			title={title}
		>
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
		</Card>
	);
}
