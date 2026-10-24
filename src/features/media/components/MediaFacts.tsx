import { useQuery } from "@tanstack/react-query";
import { mediaQueries } from "../queries";
import type { MediaDetails } from "../types";
import {
	formatLanguage,
	formatLongDate,
	formatRuntime,
	formatUsd,
} from "../utils/format";

interface MediaFactsProps {
	media: MediaDetails;
}

export function MediaFacts({ media }: MediaFactsProps) {
	const isTV = media.mediaType === "tv";
	const { data: directors } = useQuery({
		...mediaQueries.credits(media),
		select: (credits) =>
			credits.crew
				.filter((member) => member.job === "Director")
				.map((member) => member.name),
		enabled: !isTV,
	});

	const facts = isTV
		? [
				{
					label: "Created by",
					value: media.createdBy?.map((person) => person.name).join(", "),
				},
				{ label: "Network", value: media.networks?.join(", ") },
				{ label: "First aired", value: formatLongDate(media.releaseDate) },
				{ label: "Last aired", value: formatLongDate(media.lastAirDate) },
				{ label: "Seasons", value: media.numberOfSeasons?.toString() },
				{ label: "Episodes", value: media.numberOfEpisodes?.toString() },
				{ label: "Episode length", value: formatRuntime(media.runtime) },
				{ label: "Status", value: media.status },
				{
					label: "Original language",
					value: formatLanguage(media.originalLanguage),
				},
			]
		: [
				{
					label: directors && directors.length > 1 ? "Directors" : "Director",
					value: directors?.join(", "),
				},
				{ label: "Release date", value: formatLongDate(media.releaseDate) },
				{ label: "Runtime", value: formatRuntime(media.runtime) },
				{ label: "Status", value: media.status },
				{
					label: "Original language",
					value: formatLanguage(media.originalLanguage),
				},
				{ label: "Budget", value: formatUsd(media.budget) },
				{ label: "Box office", value: formatUsd(media.revenue) },
			];
	const visibleFacts = facts.filter((fact) => Boolean(fact.value));

	if (visibleFacts.length === 0) return null;

	return (
		<section className="flex flex-col gap-6">
			<h2 className="text-2xl tracking-tighter">Details</h2>
			{media.tagline && (
				<p className="text-lg italic text-muted-foreground">
					&ldquo;{media.tagline}&rdquo;
				</p>
			)}
			<dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
				{visibleFacts.map((fact) => (
					<div key={fact.label} className="flex flex-col gap-1">
						<dt className="text-sm text-muted-foreground">{fact.label}</dt>
						<dd className="font-medium">{fact.value}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
