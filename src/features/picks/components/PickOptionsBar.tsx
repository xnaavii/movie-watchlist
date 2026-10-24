import { z } from "zod";
import {
	NativeSelect,
	NativeSelectOption,
} from "#/components/ui/native-select";
import { authClient } from "#/lib/auth-client";
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

/**
 * The last AI picks run lives in the URL, so coming back from a title lands
 * on the same cached answer instead of asking the AI again.
 */
export const pickSearchSchema = z.object({
	mood: z.enum(PICK_MOODS).optional().catch(undefined),
	time: z.enum(["short", "medium"]).optional().catch(undefined),
	company: z.enum(PICK_COMPANY).optional().catch(undefined),
	watchlist: z.boolean().optional().catch(undefined),
	attempt: z.coerce.number().int().positive().optional().catch(undefined),
});
export type PickSearch = z.infer<typeof pickSearchSchema>;

export function pickOptionsFromSearch(search: PickSearch): PickOptions {
	return {
		mood: search.mood,
		time: search.time ?? "any",
		company: search.company,
		useWatchlist: search.watchlist ?? false,
	};
}

/** Defaults are left out so a plain run keeps a short URL. */
export function pickOptionsToSearch(options: PickOptions): PickSearch {
	return {
		mood: options.mood,
		time: options.time === "any" ? undefined : options.time,
		company: options.company,
		watchlist: options.useWatchlist || undefined,
		attempt: undefined,
	};
}

type PickOptionsBarProps = {
	values: PickOptions;
	onChange: (patch: Partial<PickOptions>) => void;
};

/** The AI picks options, laid out like the search filter bar. */
export function PickOptionsBar({ values, onChange }: PickOptionsBarProps) {
	// Picks work signed out; only the watchlist option needs an account.
	const { data: session } = authClient.useSession();

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

			{session && (
				<PickPill
					selected={values.useWatchlist}
					onClick={() => onChange({ useWatchlist: !values.useWatchlist })}
				>
					From my watchlist
				</PickPill>
			)}
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
