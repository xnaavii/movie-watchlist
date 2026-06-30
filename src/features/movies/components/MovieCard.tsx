import { Link } from "@tanstack/react-router";
import { TicketPlus } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Button } from "#/components/ui/button";

interface MovieCardProps {
	id: number;
	title: string;
	imageSrc: string;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";

const MovieCard: React.FC<MovieCardProps> = ({ id, title, imageSrc }) => {
	return (
		<AspectRatio
			className="relative rounded-lg overflow-hidden bg-muted"
			ratio={2 / 3}
		>
			<Link to="/movies/$id" params={{ id: `${id}` }}>
				<img
					src={IMAGE_BASE_URL + imageSrc}
					alt={title}
					className="absolute top-0 left-0 w-full h-full object-cover"
				/>
			</Link>
			<Button size="icon" className="absolute bottom-0 right-0 mr-2 mb-2">
				<TicketPlus />
			</Button>
		</AspectRatio>
	);
};

export default MovieCard;
