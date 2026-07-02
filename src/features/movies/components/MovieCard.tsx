import { Link } from "@tanstack/react-router";
import { TicketPlus } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Button } from "#/components/ui/button";

interface MovieCardProps {
	id: number;
	title: string;
	imageSrc: string | null;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original/";

const MovieCard: React.FC<MovieCardProps> = ({ id, title, imageSrc }) => {
	return (
		<AspectRatio
			className="relative rounded-lg overflow-hidden bg-muted"
			ratio={2 / 3}
		>
			<Link to="/movies/$id" params={{ id: `${id}` }}>
				{imageSrc ? (
					<img
						src={IMAGE_BASE_URL + imageSrc}
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
