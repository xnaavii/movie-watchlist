import { CalendarClock, ChevronDown, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible";
import type { MediaDetails, MediaEpisode, MediaSeason } from "../types";
import { formatReleaseYear } from "../utils";
import { formatSeasons } from "../utils/format";
import { toTmdbImageUrl } from "../utils/tmdb";

/** Long-running shows start collapsed so the page doesn't turn into a list. */
const VISIBLE_SEASONS = 5;

const airDateFormat = new Intl.DateTimeFormat("en-US", {
	weekday: "short",
	month: "short",
	day: "numeric",
	timeZone: "UTC",
});

interface TVSeasonsProps {
	show: MediaDetails;
}

export function TVSeasons({ show }: TVSeasonsProps) {
	const [open, setOpen] = useState(false);
	const seasons = show.seasons ?? [];

	if (seasons.length === 0) return null;

	const summary = [
		formatSeasons(show.numberOfSeasons),
		show.numberOfEpisodes ? `${show.numberOfEpisodes} episodes` : null,
	].filter(Boolean);
	// Newest season first: that's the one people are deciding whether to start.
	const ordered = [...seasons].reverse();
	const visible = ordered.slice(0, VISIBLE_SEASONS);
	const hidden = ordered.slice(VISIBLE_SEASONS);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl tracking-tighter">Seasons</h2>
				{summary.length > 0 && (
					<p className="text-sm text-muted-foreground">{summary.join(" · ")}</p>
				)}
			</div>

			{show.nextEpisode && <NextEpisode episode={show.nextEpisode} />}

			<Collapsible open={open} onOpenChange={setOpen}>
				<ol className="flex flex-col divide-y divide-border">
					{visible.map((season) => (
						<SeasonItem key={season.id} season={season} />
					))}
				</ol>
				{hidden.length > 0 && (
					<>
						<CollapsibleContent asChild>
							<ol className="flex flex-col divide-y divide-border border-t">
								{hidden.map((season) => (
									<SeasonItem key={season.id} season={season} />
								))}
							</ol>
						</CollapsibleContent>
						<CollapsibleTrigger asChild>
							<Button variant="ghost" className="mt-2 w-fit">
								{open ? "Show fewer" : `Show all ${ordered.length} seasons`}
								<ChevronDown
									data-icon="inline-end"
									className={open ? "rotate-180" : undefined}
								/>
							</Button>
						</CollapsibleTrigger>
					</>
				)}
			</Collapsible>
		</section>
	);
}

/** Highlights the upcoming episode, the one bit of news on a show's page. */
function NextEpisode({ episode }: { episode: MediaEpisode }) {
	return (
		<div className="flex items-center gap-4 rounded-3xl bg-primary/10 p-4 ring-1 ring-primary/30 md:p-5">
			<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
				<CalendarClock className="size-5" aria-hidden="true" />
			</div>
			<div className="flex min-w-0 flex-col gap-0.5">
				<p className="text-sm font-medium text-primary">
					Next episode
					{episode.airDate &&
						` · ${airDateFormat.format(new Date(episode.airDate))}`}
				</p>
				<p className="truncate font-medium">
					<span className="tabular-nums">
						S{episode.seasonNumber} E{episode.episodeNumber}
					</span>
					{episode.name && (
						<span className="text-muted-foreground"> · {episode.name}</span>
					)}
				</p>
			</div>
		</div>
	);
}

function SeasonItem({ season }: { season: MediaSeason }) {
	const poster = toTmdbImageUrl(season.posterPath, "w154");
	const year = season.airDate ? formatReleaseYear(season.airDate) : null;
	const meta = [
		`${season.episodeCount} ${season.episodeCount === 1 ? "episode" : "episodes"}`,
		year,
	].filter(Boolean);

	return (
		<li className="flex items-center gap-4 py-3">
			<span className="w-10 shrink-0 text-right text-3xl font-medium tracking-tighter tabular-nums text-muted-foreground md:w-12 md:text-4xl">
				{season.seasonNumber}
			</span>
			<div className="aspect-2/3 w-10 shrink-0 overflow-hidden rounded-lg bg-muted md:w-12">
				{poster && (
					<img
						src={poster}
						alt=""
						className="size-full object-cover"
						loading="lazy"
					/>
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<p className="truncate font-medium">{season.name}</p>
				<p className="text-sm text-muted-foreground">{meta.join(" · ")}</p>
			</div>
			{season.voteAverage ? (
				<span className="flex shrink-0 items-center gap-1 text-sm tabular-nums">
					<Star className="size-3.5 fill-current" aria-hidden="true" />
					{season.voteAverage.toFixed(1)}
				</span>
			) : null}
		</li>
	);
}
