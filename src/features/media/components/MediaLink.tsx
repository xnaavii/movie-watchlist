import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { MediaRef } from "../types";
import { toMediaSlug } from "../utils/slug";

interface MediaLinkProps {
	media: MediaRef & { title: string };
	className?: string;
	title?: string;
	"aria-label"?: string;
	tabIndex?: number;
	children?: ReactNode;
}

/** Links to a movie's or a TV show's details page. */
export function MediaLink({ media, ...props }: MediaLinkProps) {
	if (media.mediaType === "tv") {
		return (
			<Link
				to="/tv/$tvSlug"
				params={{ tvSlug: toMediaSlug(media) }}
				{...props}
			/>
		);
	}

	return (
		<Link
			to="/movies/$movieSlug"
			params={{ movieSlug: toMediaSlug(media) }}
			{...props}
		/>
	);
}
