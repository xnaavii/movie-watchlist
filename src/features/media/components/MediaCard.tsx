import { AspectRatio } from "#/components/ui/aspect-ratio";
import { WatchlistBadge } from "#/features/watchlist/components/WatchlistBadge";
import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { cn } from "#/lib/utils";
import type { MediaItem } from "../types";
import { formatReleaseYear, MEDIA_TYPE_LABELS } from "../utils";
import { MediaLink } from "./MediaLink";
import { MediaLogo } from "./MediaLogo";

type MediaCardProps = {
	media: MediaItem;
	variant?: "poster" | "backdrop";
	watchlistStatus?: WatchlistStatus | null;
	logoSrc?: string;
	className?: string;
};

export function MediaCard({
	media,
	variant = "poster",
	watchlistStatus,
	logoSrc,
	className,
}: MediaCardProps) {
	const isBackdrop = variant === "backdrop";
	const imageSrc = isBackdrop ? media.backdropPath : media.posterPath;
	const aspectRatio = isBackdrop ? 16 / 9 : 2 / 3;
	const meta = `${MEDIA_TYPE_LABELS[media.mediaType]} · ${formatReleaseYear(media.releaseDate)}`;

	return (
		<div className="flex flex-col gap-2 w-full">
			<div
				className={cn(
					"relative mx-auto w-full group rounded-3xl overflow-hidden shrink-0",
					className,
				)}
				title={media.title}
			>
				{watchlistStatus && (
					<div className="absolute top-3 right-3 z-20">
						<WatchlistBadge status={watchlistStatus} />
					</div>
				)}
				<MediaLink media={media} className="block size-full focus:outline-none">
					<AspectRatio ratio={aspectRatio} className="relative">
						{imageSrc ? (
							<img
								src={imageSrc}
								alt={media.title}
								className={cn(
									"size-full object-cover transition-all duration-200 group-hover:scale-105",
									watchlistStatus === "want_to_watch" ? "saturate-0" : "",
								)}
								loading="eager"
							/>
						) : (
							<div className="bg-muted size-full flex items-center justify-center text-xs text-muted-foreground">
								No image
							</div>
						)}
						{variant === "backdrop" && logoSrc && (
							<MediaLogo
								logoSrc={logoSrc}
								title={media.title}
								className="w-40 absolute inset-0 p-4"
							/>
						)}
					</AspectRatio>
				</MediaLink>

				{variant === "poster" && (
					<div className="rounded-xl absolute inset-0 flex-col justify-end gap-1 p-4 size-full hidden group-hover:flex group-focus-within:flex bg-background/80 transition-discrete pointer-events-none">
						<h4 className="text-sm font-semibold line-clamp-1">
							{media.title}
						</h4>
						<p className="text-xs text-muted-foreground">{meta}</p>
					</div>
				)}
				<div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] inset-ring-2 inset-ring-muted transition-all duration-200 group-hover:inset-ring-foreground group-has-focus-visible:inset-ring-foreground" />
			</div>

			{variant === "backdrop" && (
				<div className="flex flex-col gap-0.5 px-1">
					<h4 className="text-sm md:text-base font-semibold line-clamp-1">
						{media.title}
					</h4>
					<p className="text-xs md:text-sm text-muted-foreground">{meta}</p>
				</div>
			)}
		</div>
	);
}
