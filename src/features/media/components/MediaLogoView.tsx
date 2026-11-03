import { useQuery } from "@tanstack/react-query";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { MediaLogo } from "./MediaLogo";

interface MediaLogoViewProps {
	media: MediaRef;
	title: string;
	className?: string;
	imageClassName?: string;
	/** Text style for the title shown until the logo loads, or if it fails. */
	fallbackClassName: string;
}

export function MediaLogoView({
	media,
	title,
	className,
	imageClassName,
	fallbackClassName,
}: MediaLogoViewProps) {
	const { data: images, isLoading } = useQuery(mediaQueries.images(media));

	// Most titles have a logo, so the title holds its spot while we find out.
	if (isLoading) {
		return (
			<p aria-hidden="true" className={fallbackClassName}>
				{title}
			</p>
		);
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
			fallbackClassName={fallbackClassName}
			overBackground
		/>
	);
}
