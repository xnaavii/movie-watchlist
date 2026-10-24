import { useQuery } from "@tanstack/react-query";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { toTmdbImageUrl } from "../utils/tmdb";
import { pickWhereToWatch } from "../utils/watchProviders";

const KIND_LABELS = {
	stream: "Stream",
	free: "Free",
	rent: "Rent",
	buy: "Buy",
} as const;

interface MediaWhereToWatchViewProps {
	media: MediaRef;
}

export function MediaWhereToWatchView({ media }: MediaWhereToWatchViewProps) {
	const { data: whereToWatch, isLoading } = useQuery({
		...mediaQueries.watchProviders(media),
		select: (data) => pickWhereToWatch(data.results),
	});

	if (isLoading) {
		return (
			<section className="flex flex-col gap-6">
				<h2 className="text-2xl tracking-tighter">Where to Watch</h2>
				<div className="flex gap-4">
					{Array.from({ length: 4 }, (_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							key={i}
							className="size-14 md:size-16 rounded-full bg-muted animate-pulse"
						/>
					))}
				</div>
			</section>
		);
	}

	if (!whereToWatch) return null;

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl tracking-tighter">Where to Watch</h2>
				<p className="text-sm text-muted-foreground">
					Availability in {whereToWatch.region}, powered by JustWatch
				</p>
			</div>
			<ul className="flex flex-wrap gap-4 md:gap-6">
				{whereToWatch.options.map((option) => (
					<li key={option.provider_id}>
						<a
							href={whereToWatch.link}
							target="_blank"
							rel="noopener noreferrer"
							title={`${KIND_LABELS[option.kind]} on ${option.provider_name}`}
							className="group flex flex-col items-center gap-2 w-16 md:w-20 text-center"
						>
							<img
								src={toTmdbImageUrl(option.logo_path, "w154")}
								alt={option.provider_name}
								className="size-14 md:size-16 rounded-full object-cover ring-2 ring-muted transition-all duration-200 group-hover:ring-foreground"
								loading="lazy"
							/>
							<span className="text-xs text-muted-foreground">
								{KIND_LABELS[option.kind]}
							</span>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}
