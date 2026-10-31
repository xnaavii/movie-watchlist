import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { BrandedTitle } from "#/components/BrandedTitle";
import { MediaBackdropMarquee } from "#/features/media/components/MediaBackdropMarquee";
import { type DiscoverGenre, genreTagline } from "#/features/media/genres";
import { mediaQueries } from "#/features/media/queries";
import type { MediaType } from "#/features/media/types";
import { interleave } from "#/features/media/utils";
import { MEDIA_TYPE_CONFIG } from "../mediaTypes";

export interface GenreHeroProps {
	genre: DiscoverGenre;
	mediaTypes: MediaType[];
}

export function GenreHero({ genre, mediaTypes }: GenreHeroProps) {
	const queryClient = useQueryClient();
	// The loader fetched the first page of each type for the grid below.
	const backdrops = useMemo(() => {
		const [first = [], second = []] = mediaTypes.map(
			(mediaType) =>
				queryClient.getQueryData(
					mediaQueries.popularInGenre(genre, mediaType).queryKey,
				)?.pages[0]?.results ?? [],
		);
		return interleave(first, second);
	}, [queryClient, genre, mediaTypes]);

	return (
		<div className="relative isolate flex items-center justify-center">
			<div className="absolute flex flex-col items-center gap-3 z-20 px-4 text-center">
				<div className="flex gap-1.5">
					{mediaTypes.map((mediaType) => {
						const { icon: Icon, pluralLabel } = MEDIA_TYPE_CONFIG[mediaType];
						return (
							<span
								key={mediaType}
								className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground [&_svg]:size-3.5"
							>
								<Icon aria-hidden="true" />
								{pluralLabel}
							</span>
						);
					})}
				</div>
				<BrandedTitle>{genre.name}</BrandedTitle>
				<p className="text-sm lg:text-base text-muted-foreground">
					{genreTagline(genre)}
				</p>
			</div>
			<div className="pointer-events-none absolute inset-0 size-full bg-background/60 z-10"></div>
			<MediaBackdropMarquee items={backdrops} />
		</div>
	);
}
