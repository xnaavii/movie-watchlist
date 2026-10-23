import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

interface WatchProgressProps {
	watched: number;
	wantToWatch: number;
}

export function WatchProgress({ watched, wantToWatch }: WatchProgressProps) {
	const total = watched + wantToWatch;
	const percent = total ? Math.round((watched / total) * 100) : 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Watchlist progress</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<p className="text-4xl font-semibold tracking-tight tabular-nums">
					{percent}%
					<span className="ml-2 text-sm font-normal text-muted-foreground tracking-normal">
						watched
					</span>
				</p>
				<div
					role="progressbar"
					aria-label="Movies watched"
					aria-valuemin={0}
					aria-valuemax={total}
					aria-valuenow={watched}
					className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
				>
					{watched > 0 && (
						<div
							className="h-full rounded-full bg-primary"
							style={{ width: `${percent}%` }}
						/>
					)}
				</div>
				<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
					<LegendItem swatch="bg-primary" label="Watched" value={watched} />
					<LegendItem
						swatch="bg-muted ring-1 ring-border"
						label="Want to watch"
						value={wantToWatch}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function LegendItem({
	swatch,
	label,
	value,
}: {
	swatch: string;
	label: string;
	value: number;
}) {
	return (
		<div className="flex items-center gap-2">
			<span className={`size-2.5 rounded-full ${swatch}`} />
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium tabular-nums">{value}</span>
		</div>
	);
}
