import { useQuery } from "@tanstack/react-query";
import { RowCarousel } from "#/components/RowCarousel";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { CarouselItem } from "#/components/ui/carousel";
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
		<section>
			<RowCarousel header={<h2 className="text-2xl tracking-tighter">Cast</h2>}>
				{cast.map((person) => (
					<CarouselItem key={person.id} className="pl-4 basis-auto">
						<div className="flex flex-col items-center gap-3 w-28 md:w-32 text-center">
							<Avatar className="size-20 md:size-24">
								<AvatarImage
									src={toTmdbImageUrl(person.profile_path, "w185")}
									alt={person.name}
									className="object-cover"
								/>
								<AvatarFallback>{initials(person.name)}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col gap-0.5">
								<span className="text-sm font-medium leading-snug text-balance wrap-break-word">
									{person.name}
								</span>
								{person.character && (
									<span
										className="text-xs text-muted-foreground leading-snug text-balance line-clamp-2"
										title={person.character}
									>
										{person.character}
									</span>
								)}
							</div>
						</div>
					</CarouselItem>
				))}
			</RowCarousel>
		</section>
	);
}
