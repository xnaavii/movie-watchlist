interface MovieCardProps {
	id: number;
	title: string;
	imageSrc: string;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";

const MovieCard: React.FC<MovieCardProps> = ({ id, title, imageSrc }) => {
	return (
		<div>
			<h1>{title}</h1>
			<img src={IMAGE_BASE_URL + imageSrc} alt={title} />
		</div>
	);
};

export default MovieCard;
