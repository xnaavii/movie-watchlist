import { ExternalLink } from "lucide-react";
import {
	DISC_FORMATS,
	type DiscRelease,
	type DiscReleases,
} from "../utils/discReleases";
import { formatRegion, formatReviewDate } from "../utils/format";

interface DiscReleasesListProps {
	discs: DiscReleases;
	/** Where to check which editions exist, since TMDB often omits formats. */
	discLink: string;
	/** Today as YYYY-MM-DD, to tell released from upcoming discs. */
	today: string;
}

const formatsLabel = (release: DiscRelease) =>
	release.formats.length > 0
		? release.formats.map((format) => DISC_FORMATS[format].label).join(", ")
		: "Format not listed";

/** Plain list of DVD, Blu-ray and 4K releases per country. */
export function DiscReleasesList({
	discs,
	discLink,
	today,
}: DiscReleasesListProps) {
	return (
		<div className="flex flex-col gap-3">
			<h3 className="text-sm font-medium text-muted-foreground">On disc</h3>
			<ul className="flex flex-col divide-y divide-border max-w-3xl">
				{discs.releases.map((release) => (
					<li
						key={`${release.region}:${release.date}:${release.formats.join()}`}
						className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
					>
						<span>
							<span className="font-medium">{formatsLabel(release)}</span>
							<span className="text-muted-foreground">
								{" "}
								· {formatRegion(release.region)}
							</span>
						</span>
						<span className="text-muted-foreground tabular-nums">
							{release.date > today ? "Coming " : ""}
							{formatReviewDate(release.date)}
						</span>
					</li>
				))}
			</ul>
			<a
				href={discLink}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
			>
				Check 4K and Blu-ray editions on Blu-ray.com
				<ExternalLink className="size-3.5" aria-hidden />
			</a>
		</div>
	);
}
