import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
import { Skeleton } from "#/components/ui/skeleton";
import { movieQueries } from "../queries";
import { MovieBackdropImage } from "./MovieBackdropImage";

interface MovieBackdropImageViewProps {
	movieId: number;
	title: string;
}

export function MovieBackdropImageView({
	movieId,
	title,
}: MovieBackdropImageViewProps) {
	const { data: images, isLoading } = useQuery(
		movieQueries.images({ movie_id: movieId }),
	);

	if (isLoading) {
		return <Skeleton className="size-full" />;
	}

	const backdropSrc =
		images?.backdrops[0] &&
		`https://image.tmdb.org/t/p/original${images.backdrops[0].file_path}`;

	if (!backdropSrc) {
		return (
			<div className="inset-0 size-full min-h-svh bg-muted flex flex-col items-center justify-center">
				<ImageOff />
				<p className="text-xl text-muted-foreground">No Image</p>
			</div>
		);
	}

	return <MovieBackdropImage src={backdropSrc} title={title} />;
}
