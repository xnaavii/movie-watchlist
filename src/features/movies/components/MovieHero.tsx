import { BookmarkPlus } from "lucide-react";
import { Button } from "#/components/ui/button";

type MovieHeroProps = {
	title: string;
	runtime: string;
	imageSrc: string;
	genres: number[];
	releaseDate: string;
	storyline: string;
};

const MovieHero: React.FC<MovieHeroProps> = ({
	title,
	runtime,
	genres,
	releaseDate,
	storyline,
}) => {
	return (
		<div className="relative p-6 flex justify-between rounded-md">
			<div className="absolute bg-linear-to-r from-black to-transparent" />
			<h2>{title}</h2>
			<div>
				<span>{runtime}</span>
				<ul>
					{genres.map((genre) => (
						<li key={genre}>{genre}</li>
					))}
				</ul>
				<span>{releaseDate}</span>
			</div>
			<p>{storyline}</p>

			<div>
				<Button>
					Add to watchlist <BookmarkPlus />
				</Button>
				<Button variant="secondary">Details</Button>
			</div>
		</div>
	);
};

export default MovieHero;
