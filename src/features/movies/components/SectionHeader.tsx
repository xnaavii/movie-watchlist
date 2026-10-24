import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	ALL_GENRES_SLUG,
	type DiscoverSectionSlug,
	type SectionGenre,
} from "../sections";
import { toGenreSlug } from "../utils/slug";

interface SectionHeaderProps {
	title: string;
	description?: string;
	/** Adds a "See more" link to the section's full page. */
	section?: DiscoverSectionSlug;
	genre?: SectionGenre;
}

export function SectionHeader({
	title,
	description,
	section,
	genre,
}: SectionHeaderProps) {
	return (
		<div className="flex items-end justify-between gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="text-xl lg:text-2xl tracking-tighter">{title}</h2>
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			{section && (
				<Button variant="link" asChild className="shrink-0 px-0">
					<Link
						to="/discover/$genreSlug/$section"
						params={{
							genreSlug: genre ? toGenreSlug(genre) : ALL_GENRES_SLUG,
							section,
						}}
						aria-label={`See more ${title}`}
					>
						See more
						<ChevronRight data-icon="inline-end" aria-hidden="true" />
					</Link>
				</Button>
			)}
		</div>
	);
}
