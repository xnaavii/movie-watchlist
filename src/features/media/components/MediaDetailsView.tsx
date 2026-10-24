import type { MediaDetails } from "../types";
import { formatRuntime, formatSeasons } from "../utils/format";
import { Genres } from "./Genres";
import { IMDBRatingView } from "./IMDBRatingView";
import { MediaCreditsView } from "./MediaCreditsView";
import { MediaOverview } from "./MediaOverview";

export function MediaDetailsView({ media }: { media: MediaDetails }) {
	const year = media.releaseDate?.slice(0, 4);
	const meta =
		media.mediaType === "tv"
			? [
					formatAirYears(year, media.lastAirDate, media.status),
					formatSeasons(media.numberOfSeasons),
				]
			: [year, formatRuntime(media.runtime)];
	const visibleMeta = meta.filter(Boolean);

	return (
		<div className="flex flex-col items-center md:items-start gap-4 text-sm md:text-base max-w-[65ch]">
			<div className="flex flex-col items-center md:items-start gap-1">
				<h1 className="font-medium tracking-tighter text-3xl md:text-4xl">
					{media.title}
				</h1>
				{visibleMeta.length > 0 && (
					<p className="text-muted-foreground">{visibleMeta.join(" · ")}</p>
				)}
			</div>
			<Genres
				genres={media.genres}
				className="justify-center md:justify-start"
			/>
			{media.overview && (
				<MediaOverview
					overview={media.overview}
					className="flex-col md:flex-row items-center md:items-end gap-2 md:gap-0"
				/>
			)}
			<div className="flex flex-col items-center md:items-start gap-1.5">
				<IMDBRatingView imdbId={media.imdbId} />
				<MediaCreditsView
					media={media}
					createdBy={media.mediaType === "tv" ? media.createdBy : undefined}
				/>
			</div>
		</div>
	);
}

/** "2011–2019" for finished shows, "2022–" while they're still running. */
function formatAirYears(
	firstYear: string | undefined,
	lastAirDate: string | undefined,
	status: string | undefined,
): string | undefined {
	if (!firstYear) return undefined;
	const ended = status === "Ended" || status === "Canceled";
	if (!ended) return `${firstYear}–`;
	const lastYear = lastAirDate?.slice(0, 4);
	return lastYear && lastYear !== firstYear
		? `${firstYear}–${lastYear}`
		: firstYear;
}
