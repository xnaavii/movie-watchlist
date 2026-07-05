import { Link } from "@tanstack/react-router";
import { TicketPlus } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Button } from "#/components/ui/button";
import { getMovieImage } from "../utils/tmdb";

type MovieCardProps = {
	id: number;
	title: string;
	imageSrc: string | null;
};

export function MovieCard({ id, title, imageSrc }: MovieCardProps) {
	const posterImage = getMovieImage(imageSrc, "w342");

	return (
		<AspectRatio className="relative rounded-md overflow-hidden" ratio={2 / 3}>
			<Link to="/movies/$id" params={{ id: `${id}` }}>
				{posterImage ? (
					<img
						src={posterImage}
						alt={title}
						className="size-full"
						loading="lazy"
					/>
				) : (
					<div className="bg-muted flex items-center justify-center text-xs text-muted-foreground">
						No image
					</div>
				)}
			</Link>
			<Button size="icon" className="absolute bottom-0 right-0 mr-2 mb-2">
				<TicketPlus />
			</Button>
		</AspectRatio>
	);
}
