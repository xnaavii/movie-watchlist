import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "#/components/ui/skeleton";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { MediaLogo } from "./MediaLogo";

interface MediaLogoViewProps {
	media: MediaRef;
	title: string;
	className?: string;
}

export function MediaLogoView({ media, title, className }: MediaLogoViewProps) {
	const { data: images, isLoading } = useQuery(mediaQueries.images(media));

	if (isLoading) {
		return <Skeleton className="h-24 w-80 rounded-xl" />;
	}

	const logoSrc =
		images?.logos[0] &&
		`https://image.tmdb.org/t/p/original${images.logos[0].file_path}`;

	if (!logoSrc) {
		return <div>{title}</div>;
	}

	return <MediaLogo logoSrc={logoSrc} title={title} className={className} />;
}
