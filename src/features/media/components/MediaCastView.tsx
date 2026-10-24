import { useQuery } from "@tanstack/react-query";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { toTmdbImageUrl } from "../utils/tmdb";

const MAX_CAST = 20;

const initials = (name: string) =>
	name
		.split(" ")
		.map((part) => part[0])
		.slice(0, 2)
		.join("");

interface MediaCastViewProps {
	media: MediaRef;
}

export function MediaCastView({ media }: MediaCastViewProps) {
	const { data: cast } = useQuery({
		...mediaQueries.credits(media),
		select: (credits) => credits.cast.slice(0, MAX_CAST),
	});

	if (!cast || cast.length === 0) return null;

	return (
		<section className="flex flex-col gap-6">
			<h2 className="text-2xl tracking-tighter">Cast</h2>
			<Carousel
				opts={{ align: "start", dragFree: true }}
				plugins={[WheelGesturesPlugin()]}
			>
				<CarouselContent className="-ml-4">
					{cast.map((person) => (
						<CarouselItem key={person.id} className="pl-4 basis-auto">
							<div className="flex flex-col items-center gap-2 w-24 md:w-28 text-center">
								<Avatar className="size-20 md:size-24">
									<AvatarImage
										src={toTmdbImageUrl(person.profile_path, "w185")}
										alt={person.name}
										className="object-cover"
									/>
									<AvatarFallback>{initials(person.name)}</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<span className="text-sm font-medium line-clamp-1">
										{person.name}
									</span>
									<span className="text-xs text-muted-foreground line-clamp-1">
										{person.character}
									</span>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="absolute left-0 ml-2" />
				<CarouselNext className="absolute right-0 mr-2" />
			</Carousel>
		</section>
	);
}
