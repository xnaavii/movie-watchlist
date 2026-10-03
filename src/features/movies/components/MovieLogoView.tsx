import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "#/components/ui/skeleton";
import { movieQueries } from "../queries";
import { MovieLogo } from "./MovieLogo";

interface MovieLogoViewProps {
	movieId: number;
	title: string;
	className?: string;
}

export function MovieLogoView({
	movieId,
	title,
	className,
}: MovieLogoViewProps) {
	const { data: images, isLoading } = useQuery(
		movieQueries.images({ movie_id: movieId }),
	);

	if (isLoading) {
		return <Skeleton className="h-24 w-80 rounded-xl" />;
	}

	const logoSrc =
		images?.logos[0] &&
		`https://image.tmdb.org/t/p/original${images.logos[0].file_path}`;

	if (!logoSrc) {
		return <div>{title}</div>;
	}

	return <MovieLogo logoSrc={logoSrc} title={title} className={className} />;
}
