import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "#/components/ui/skeleton";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { MediaLogo } from "./MediaLogo";

interface MediaLogoViewProps {
	media: MediaRef;
	title: string;
	className?: string;
	imageClassName?: string;
}

export function MediaLogoView({
	media,
	title,
	className,
	imageClassName,
}: MediaLogoViewProps) {
	const { data: images, isLoading } = useQuery(mediaQueries.images(media));

	if (isLoading) {
		return <Skeleton className="h-20 w-64 rounded-xl" />;
	}

	const logoSrc =
		images?.logos[0] &&
		`https://image.tmdb.org/t/p/original${images.logos[0].file_path}`;

	// Without a logo the page heading carries the title on its own.
	if (!logoSrc) return null;

	return (
		<MediaLogo
			logoSrc={logoSrc}
			title={title}
			className={className}
			imageClassName={imageClassName}
			overBackground
		/>
	);
}
