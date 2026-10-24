import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	PICK_COMPANY,
	PICK_MOODS,
	PICK_TIMES,
	type PickRequest,
} from "../types";
import { PickPill } from "./PickPill";

const ANY = "any";

export type PickOptions = Omit<PickRequest, "prompt" | "moods"> & {
	mood?: PickRequest["moods"][number];
};

export const DEFAULT_PICK_OPTIONS: PickOptions = {
	mood: undefined,
	time: "any",
	company: undefined,
	useWatchlist: false,
};

type PickOptionsBarProps = {
	values: PickOptions;
	onChange: (patch: Partial<PickOptions>) => void;
};

/** The AI picks options, laid out like the search filter bar. */
export function PickOptionsBar({ values, onChange }: PickOptionsBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Select
				value={values.mood ?? ANY}
				onValueChange={(value) =>
					onChange({
						mood: value === ANY ? undefined : (value as PickOptions["mood"]),
					})
				}
			>
				<SelectTrigger aria-label="Mood">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ANY}>Any mood</SelectItem>
					{PICK_MOODS.map((mood) => (
						<SelectItem key={mood} value={mood}>
							{mood}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={values.time}
				onValueChange={(value) =>
					onChange({ time: value as PickOptions["time"] })
				}
			>
				<SelectTrigger aria-label="Length">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{PICK_TIMES.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={values.company ?? ANY}
				onValueChange={(value) =>
					onChange({
						company:
							value === ANY ? undefined : (value as PickOptions["company"]),
					})
				}
			>
				<SelectTrigger aria-label="Watching with">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ANY}>Anyone</SelectItem>
					{PICK_COMPANY.map((company) => (
						<SelectItem key={company} value={company}>
							{company}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<PickPill
				selected={values.useWatchlist}
				onClick={() => onChange({ useWatchlist: !values.useWatchlist })}
			>
				From my watchlist
			</PickPill>
		</div>
	);
}

export function toPickRequest(prompt: string, options: PickOptions) {
	const { mood, ...rest } = options;
	return {
		...rest,
		prompt: prompt.trim(),
		moods: mood ? [mood] : [],
	} satisfies PickRequest;
}
