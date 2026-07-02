import { Link } from "@tanstack/react-router";
import { TicketPlus } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Button } from "#/components/ui/button";
import { getMovieImage } from "../utils/tmdb";

interface MovieCardProps {
	id: number;
	title: string;
	imageSrc: string | null;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, imageSrc }) => {
	const posterImage = getMovieImage(imageSrc, "w342");

	return (
		<AspectRatio
			className="relative rounded-lg overflow-hidden bg-muted"
			ratio={2 / 3}
		>
			<Link to="/movies/$id" params={{ id: `${id}` }}>
				{posterImage ? (
					<img
						src={posterImage}
						alt={title}
						className="absolute top-0 left-0 w-full h-full object-cover"
						loading="lazy"
					/>
				) : (
					<div className="absolute top-0 left-0 w-full h-full bg-muted aspect-2/3 flex items-center justify-center text-xs text-muted-foreground">
						No image
					</div>
				)}
			</Link>
			<Button size="icon" className="absolute bottom-0 right-0 mr-2 mb-2">
				<TicketPlus />
			</Button>
		</AspectRatio>
	);
};

export default MovieCard;
