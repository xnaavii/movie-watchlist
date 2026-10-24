import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
import { Skeleton } from "#/components/ui/skeleton";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { MediaBackdropImage } from "./MediaBackdropImage";

interface MediaBackdropImageViewProps {
	media: MediaRef;
	title: string;
}

export function MediaBackdropImageView({
	media,
	title,
}: MediaBackdropImageViewProps) {
	const { data: images, isLoading } = useQuery(mediaQueries.images(media));

	if (isLoading) {
		return (
			<Skeleton className="aspect-video w-full md:aspect-auto md:size-full" />
		);
	}

	const backdropSrc =
		images?.backdrops[0] &&
		`https://image.tmdb.org/t/p/original${images.backdrops[0].file_path}`;

	if (!backdropSrc) {
		return (
			<div className="inset-0 w-full aspect-video md:aspect-auto md:size-full md:min-h-svh bg-muted flex flex-col items-center justify-center">
				<ImageOff />
				<p className="text-xl text-muted-foreground">No Image</p>
			</div>
		);
	}

	return <MediaBackdropImage src={backdropSrc} title={title} />;
}
