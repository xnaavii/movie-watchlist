import type { ReactNode } from "react";
import { Marquee } from "#/components/shadcn-space/animations/marquee";
import { cn } from "#/lib/utils";
import type { MediaItem } from "../types";
import { mediaKey } from "../utils";
import { MediaLink } from "./MediaLink";

interface MediaBackdropMarquee {
	items: MediaItem[];
	className?: string;
	children?: ReactNode;
}

export function MediaBackdropMarquee({
	items,
	className,
}: MediaBackdropMarquee) {
	const firstRow = items.slice(0, items.length / 2);
	const secondRow = items.slice(items.length / 2);

	// Decorative backdrop: the same titles are listed below, so the moving,
	// repeated copies stay out of the tab order and away from screen readers.
	return (
		<div
			aria-hidden="true"
			className={cn(
				"relative flex w-full flex-col items-center justify-center overflow-hidden",
				className,
			)}
		>
			<Marquee pauseOnHover className="[--duration:100s]">
				{firstRow.map((movie) => (
					<MediaLink
						media={movie}
						key={mediaKey(movie)}
						title={movie.title}
						className="group/card"
						tabIndex={-1}
					>
						<div className="relative h-full w-40 md:48 cursor-pointer overflow-hidden border-border bg-card shadow-none">
							{movie.backdropPath ? (
								<img
									src={movie.backdropPath}
									alt={`${movie.title}'s backdrop`}
									className="h-full w-full object-cover rounded-md"
								/>
							) : movie.posterPath ? (
								<img
									src={movie.posterPath}
									alt={`${movie.title}'s backdrop`}
									className="w-full object-cover rounded-md aspect-video object-top"
								/>
							) : (
								<div className="bg-primary/40 aspect-video rounded-md flex items-center justify-center">
									<p className="text-xs font-medium">{movie.title}</p>
								</div>
							)}
							<div className="absolute bottom-0 left-0 p-2 w-full translate-y-full bg-linear-to-t from-background to-transparent group-hover/card:translate-y-0">
								<p className="text-xs font-medium">{movie.title}</p>
							</div>
						</div>
					</MediaLink>
				))}
			</Marquee>
			<Marquee reverse pauseOnHover className="[--duration:100s]">
				{secondRow.map((movie) => (
					<MediaLink
						media={movie}
						key={mediaKey(movie)}
						title={movie.title}
						className="group/card"
						tabIndex={-1}
					>
						<div className="relative h-full w-40 md:48 cursor-pointer overflow-hidden border-border bg-card shadow-none">
							{movie.backdropPath ? (
								<img
									src={movie.backdropPath}
									alt={`${movie.title}'s backdrop`}
									className="h-full w-full object-cover rounded-md"
								/>
							) : movie.posterPath ? (
								<img
									src={movie.posterPath}
									alt={`${movie.title}'s backdrop`}
									className="w-full object-cover rounded-md aspect-video object-top"
								/>
							) : (
								<div className="bg-primary/40 aspect-video rounded-md flex items-center justify-center">
									<p className="text-xs font-medium">{movie.title}</p>
								</div>
							)}
							<div className="absolute bottom-0 left-0 p-2 w-full translate-y-full bg-linear-to-t from-background to-transparent group-hover/card:translate-y-0">
								<p className="text-xs font-medium">{movie.title}</p>
							</div>
						</div>
					</MediaLink>
				))}
			</Marquee>
			<div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"></div>
			<div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"></div>
		</div>
	);
}
