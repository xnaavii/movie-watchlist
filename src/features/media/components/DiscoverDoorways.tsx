import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { DISCOVER_TYPE_PAGES } from "../discoverPages";
import { MEDIA_TYPE_CONFIG } from "../mediaTypes";
import { MEDIA_TYPES, type MediaItem, type MediaType } from "../types";
import { toTmdbImageUrl } from "../utils/tmdb";

interface DiscoverDoorwaysProps {
	/** A title per type whose backdrop fills its tile. */
	backdrops: Partial<Record<MediaType, MediaItem>>;
}

/** Big entry points into each media type's discover page. */
export function DiscoverDoorways({ backdrops }: DiscoverDoorwaysProps) {
	return (
		<section
			aria-label="Browse by type"
			className="grid grid-cols-1 gap-3 sm:grid-cols-2"
		>
			{MEDIA_TYPES.map((mediaType) => {
				const { path, teaser } = DISCOVER_TYPE_PAGES[mediaType];
				const { pluralLabel, icon: Icon } = MEDIA_TYPE_CONFIG[mediaType];
				return (
					<Doorway
						key={mediaType}
						to={path}
						title={pluralLabel}
						teaser={teaser}
						icon={<Icon aria-hidden="true" />}
						backdrop={backdrops[mediaType]}
					/>
				);
			})}
		</section>
	);
}

interface DoorwayProps {
	to: (typeof DISCOVER_TYPE_PAGES)[MediaType]["path"];
	title: string;
	teaser: string;
	icon: ReactNode;
	backdrop?: MediaItem;
}

function Doorway({ to, title, teaser, icon, backdrop }: DoorwayProps) {
	const image = toTmdbImageUrl(backdrop?.backdropPath, "w780");

	return (
		<Link
			to={to}
			className="group relative isolate flex aspect-16/7 flex-col justify-end overflow-hidden rounded-3xl bg-muted p-5 ring-1 ring-primary/30 transition-shadow hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:p-6"
		>
			{image && (
				<img
					src={image}
					alt=""
					loading="lazy"
					className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			)}
			<div className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/40 to-black/5" />
			<span className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground md:top-5 md:left-5 [&_svg]:size-5">
				{icon}
			</span>
			<div className="flex items-end justify-between gap-4 text-white">
				<div className="flex flex-col gap-1">
					<h2 className="text-2xl font-medium tracking-tighter md:text-3xl">
						{title}
					</h2>
					<p className="text-sm text-white/75 text-pretty">{teaser}</p>
				</div>
				<ArrowRight
					aria-hidden="true"
					className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
				/>
			</div>
		</Link>
	);
}
