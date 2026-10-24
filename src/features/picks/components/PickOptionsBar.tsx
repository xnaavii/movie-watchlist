import {
	NativeSelect,
	NativeSelectOption,
} from "#/components/ui/native-select";
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
			<NativeSelect
				aria-label="Mood"
				value={values.mood ?? ANY}
				onChange={(event) => {
					const value = event.target.value;
					onChange({
						mood: value === ANY ? undefined : (value as PickOptions["mood"]),
					});
				}}
			>
				<NativeSelectOption value={ANY}>Any mood</NativeSelectOption>
				{PICK_MOODS.map((mood) => (
					<NativeSelectOption key={mood} value={mood}>
						{mood}
					</NativeSelectOption>
				))}
			</NativeSelect>

			<NativeSelect
				aria-label="Length"
				value={values.time}
				onChange={(event) =>
					onChange({ time: event.target.value as PickOptions["time"] })
				}
			>
				{PICK_TIMES.map((option) => (
					<NativeSelectOption key={option.value} value={option.value}>
						{option.label}
					</NativeSelectOption>
				))}
			</NativeSelect>

			<NativeSelect
				aria-label="Watching with"
				value={values.company ?? ANY}
				onChange={(event) => {
					const value = event.target.value;
					onChange({
						company:
							value === ANY ? undefined : (value as PickOptions["company"]),
					});
				}}
			>
				<NativeSelectOption value={ANY}>Anyone</NativeSelectOption>
				{PICK_COMPANY.map((company) => (
					<NativeSelectOption key={company} value={company}>
						{company}
					</NativeSelectOption>
				))}
			</NativeSelect>

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
