import type { ReactNode } from "react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { MediaLink } from "#/features/media/components/MediaLink";
import { formatReleaseYear } from "#/features/media/utils";
import type { AtmosShowcaseItem } from "../types";
import { formatScore } from "../utils/sound";

type AtmosTitleCardProps = {
	item: AtmosShowcaseItem;
};

export function AtmosTitleCard({ item }: AtmosTitleCardProps) {
	const year = item.releaseDate ? formatReleaseYear(item.releaseDate) : null;

	return (
		<article className="group flex flex-col gap-3">
			<TitleLink item={item}>
				<div className="relative rounded-3xl overflow-hidden">
					<AspectRatio ratio={2 / 3}>
						{item.posterPath ? (
							<img
								src={item.posterPath}
								alt={item.title}
								loading="lazy"
								className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
							/>
						) : (
							<div className="bg-muted size-full flex items-center justify-center text-xs text-muted-foreground">
								No image
							</div>
						)}
					</AspectRatio>
					<div className="absolute top-3 right-3 rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-xs font-semibold tabular-nums">
						{item.sound.count > 0 ? formatScore(item.sound.overall) : "New"}
					</div>
					<div className="pointer-events-none absolute inset-0 rounded-[inherit] inset-ring-2 inset-ring-muted transition-all duration-200 group-hover:inset-ring-foreground group-has-focus-visible:inset-ring-foreground" />
				</div>
			</TitleLink>
			<div className="flex flex-col gap-1 px-1">
				<h3 className="text-sm md:text-base font-semibold line-clamp-1">
					{item.title}
				</h3>
				<p className="text-xs text-muted-foreground">
					{[item.mediaType === "tv" ? "Series" : "Movie", year]
						.filter(Boolean)
						.join(" · ")}
					{item.sound.count > 0 &&
						` · ${item.sound.count} ${item.sound.count === 1 ? "rating" : "ratings"}`}
				</p>
				{item.note && (
					<p className="text-xs text-muted-foreground line-clamp-2 text-pretty">
						{item.note}
					</p>
				)}
			</div>
		</article>
	);
}

function TitleLink({
	item,
	children,
}: {
	item: AtmosShowcaseItem;
	children: ReactNode;
}) {
	return (
		<MediaLink
			media={{ mediaType: item.mediaType, id: item.tmdbId, title: item.title }}
			className="block focus:outline-none"
		>
			{children}
		</MediaLink>
	);
}
