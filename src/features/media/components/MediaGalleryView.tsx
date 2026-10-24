import { useQuery } from "@tanstack/react-query";
import { Images } from "lucide-react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { toTmdbImageUrl } from "../utils/tmdb";

const MAX_IMAGES = 40;
const PREVIEW_COUNT = 5;
const SRCSET_SIZES = [
	{ size: "w300", width: 300 },
	{ size: "w780", width: 780 },
	{ size: "w1280", width: 1280 },
] as const;

interface MediaGalleryViewProps {
	media: MediaRef;
	title: string;
}

export function MediaGalleryView({ media, title }: MediaGalleryViewProps) {
	const [openIndex, setOpenIndex] = useState(-1);
	const { data: stills } = useQuery({
		...mediaQueries.gallery(media),
		select: (images) => images.backdrops.slice(0, MAX_IMAGES),
	});

	if (!stills || stills.length < 2) return null;

	const slides = stills.map((still, index) => ({
		src: toTmdbImageUrl(still.file_path, "original") ?? "",
		alt: `${title} still ${index + 1}`,
		width: still.width,
		height: still.height,
		srcSet: SRCSET_SIZES.map(({ size, width }) => ({
			src: toTmdbImageUrl(still.file_path, size) ?? "",
			width,
			height: Math.round(width / still.aspect_ratio),
		})),
	}));

	const preview = stills.slice(0, PREVIEW_COUNT);
	const hiddenCount = stills.length - preview.length;

	return (
		<section className="flex flex-col gap-6">
			<div className="flex items-end justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h2 className="text-2xl tracking-tighter">Gallery</h2>
					<p className="text-sm text-muted-foreground">
						{stills.length} stills
					</p>
				</div>
				<Button variant="secondary" onClick={() => setOpenIndex(0)}>
					<Images />
					View all
				</Button>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 md:gap-3 md:h-[clamp(18rem,32vw,28rem)]">
				{preview.map((still, index) => {
					const isLead = index === 0;
					const isLast = index === preview.length - 1 && hiddenCount > 0;

					return (
						<button
							key={still.file_path}
							type="button"
							onClick={() => setOpenIndex(index)}
							className={cn(
								"group relative overflow-hidden rounded-2xl bg-muted aspect-video md:aspect-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
								isLead && "col-span-2 md:row-span-2",
								index > 2 && "hidden md:block",
							)}
						>
							<img
								src={toTmdbImageUrl(still.file_path, isLead ? "w1280" : "w780")}
								alt={`${title} still ${index + 1}`}
								className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
								loading="lazy"
							/>
							{isLast && (
								<span className="absolute inset-0 flex items-center justify-center bg-background/70 text-lg font-medium">
									+{hiddenCount} more
								</span>
							)}
						</button>
					);
				})}
			</div>

			<Lightbox
				open={openIndex >= 0}
				index={openIndex}
				close={() => setOpenIndex(-1)}
				slides={slides}
				plugins={[Thumbnails, Zoom, Counter, Fullscreen]}
				carousel={{ finite: false, preload: 2 }}
				thumbnails={{ border: 0, borderRadius: 8, gap: 12, vignette: true }}
				zoom={{ maxZoomPixelRatio: 2, scrollToZoom: true }}
				counter={{ container: { style: { top: 0, bottom: "unset" } } }}
				controller={{ closeOnBackdropClick: true }}
				styles={{ container: { backgroundColor: "rgb(0 0 0 / 0.95)" } }}
			/>
		</section>
	);
}
