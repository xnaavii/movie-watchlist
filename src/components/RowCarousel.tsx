import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import type { ReactNode } from "react";
import {
	Carousel,
	CarouselContent,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import { cn } from "#/lib/utils";

interface RowCarouselProps {
	/** Title area on the left of the header row. */
	header?: ReactNode;
	/** Extra controls before the arrows, e.g. a "See all" link. */
	actions?: ReactNode;
	/** CarouselItems; give them `pl-4` for the gap between items. */
	children: ReactNode;
	className?: string;
}

/**
 * A horizontally scrolling row that runs to the screen edges, so the cut-off
 * item at the side shows there's more to scroll. Items still start in line
 * with the page content. The arrows sit at the top right, not over the items.
 * Must sit inside a `Container`, whose padding it bleeds through.
 */
export function RowCarousel({
	header,
	actions,
	children,
	className,
}: RowCarouselProps) {
	return (
		<Carousel
			opts={{ align: "start", dragFree: true }}
			plugins={[WheelGesturesPlugin()]}
			className={cn("flex flex-col gap-4", className)}
		>
			<div className="flex items-end justify-between gap-4">
				<div className="min-w-0 flex-1">{header}</div>
				<div className="flex shrink-0 items-center gap-2">
					{actions}
					<CarouselPrevious className="static my-0 hidden md:inline-flex" />
					<CarouselNext className="static my-0 hidden md:inline-flex" />
				</div>
			</div>
			{/* Negative margins undo the Container's padding; the content's own
			    padding puts the first item back in line with the page. The
			    vertical padding keeps focus rings from being clipped. */}
			<div className="-mx-4 md:-mx-6 lg:-mx-8">
				<CarouselContent className="ml-0 py-1 pr-4 md:pl-2 md:pr-6 lg:pl-4 lg:pr-8">
					{children}
				</CarouselContent>
			</div>
		</Carousel>
	);
}
