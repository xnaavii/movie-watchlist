import { cn } from "#/lib/utils";
import {
	OVERALL_MAX,
	type SoundAggregate,
	SUB_SCORE_MAX,
	SUB_SCORES,
} from "../types";
import { formatScore } from "../utils/sound";

type SoundScoresProps = {
	sound: SoundAggregate;
	className?: string;
};

/** Community sound score with a bar per sub-score. */
export function SoundScores({ sound, className }: SoundScoresProps) {
	if (sound.count === 0) {
		return (
			<p className={cn("text-sm text-muted-foreground", className)}>
				No sound ratings yet. Be the first to rate it.
			</p>
		);
	}

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			<p className="flex items-baseline gap-2">
				<span className="text-4xl font-semibold tracking-tight">
					{formatScore(sound.overall)}
				</span>
				<span className="text-sm text-muted-foreground">
					/ {OVERALL_MAX} from {sound.count}{" "}
					{sound.count === 1 ? "rating" : "ratings"}
				</span>
			</p>
			<dl className="grid gap-2 max-w-sm">
				{SUB_SCORES.map(({ key, label }) => {
					const value = sound[key];
					return (
						<div
							key={key}
							className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm"
						>
							<dt className="text-muted-foreground">{label}</dt>
							<dd className="h-1.5 rounded-full bg-muted overflow-hidden">
								<div
									className="h-full rounded-full bg-foreground"
									style={{ width: `${((value ?? 0) / SUB_SCORE_MAX) * 100}%` }}
								/>
							</dd>
							<dd className="text-right tabular-nums">{formatScore(value)}</dd>
						</div>
					);
				})}
			</dl>
		</div>
	);
}
