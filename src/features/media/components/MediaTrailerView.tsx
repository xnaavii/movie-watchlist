import { useQuery } from "@tanstack/react-query";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { MediaTrailer } from "./MediaTrailer";
import { MediaTrailerEmpty } from "./MediaTrailerEmpty";
import { MediaTrailerSkeleton } from "./MediaTrailerSkeleton";

interface MediaTrailerViewProps {
	media: MediaRef;
	title: string;
}

export function MediaTrailerView({ media, title }: MediaTrailerViewProps) {
	const {
		data: videos,
		isLoading,
		isError,
		error,
	} = useQuery(mediaQueries.videos(media));

	if (isLoading) {
		return <MediaTrailerSkeleton />;
	}

	if (isError) {
		return (
			<p>There was an error getting the trailer. Error: {error.message}</p>
		);
	}

	const trailer = videos?.results.find((v) => v.type === "Trailer");

	if (!trailer) {
		return <MediaTrailerEmpty />;
	}

	return (
		<section className="flex flex-col gap-6">
			<h2 className="text-2xl tracking-tighter">Watch the Trailer</h2>
			<MediaTrailer trailerId={trailer.key} title={title} />
		</section>
	);
}
