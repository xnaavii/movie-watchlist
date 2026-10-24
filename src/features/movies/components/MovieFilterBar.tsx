import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	NativeSelect,
	NativeSelectOption,
} from "#/components/ui/native-select";
import { movieQueries } from "../queries";
import {
	hasActiveFilters,
	type SearchSort,
	SORT_LABELS,
	type WatchlistSort,
} from "../utils/filters";

const ANY = "any";
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
	{ length: CURRENT_YEAR - 1919 },
	(_, i) => CURRENT_YEAR - i,
);
const RATINGS = [9, 8, 7, 6, 5];
const STATUS_LABELS = {
	want_to_watch: "Want to watch",
	watched: "Watched",
} as const;

type Sort = SearchSort | WatchlistSort;
type Status = keyof typeof STATUS_LABELS;

export type MovieFilterValues = {
	genre?: number;
	from?: number;
	to?: number;
	rating?: number;
	status?: Status;
	sort?: Sort;
};

type MovieFilterBarProps = {
	values: MovieFilterValues;
	sortOptions: readonly Sort[];
	showRating?: boolean;
	showStatus?: boolean;
	onChange: (patch: MovieFilterValues) => void;
	onClear: () => void;
};

function toNumber(value: string) {
	return value === ANY ? undefined : Number(value);
}

export function MovieFilterBar({
	values,
	sortOptions,
	showRating = false,
	showStatus = false,
	onChange,
	onClear,
}: MovieFilterBarProps) {
	const { data: genres } = useQuery(movieQueries.genres({}));
	const hasFilters = hasActiveFilters(values);

	return (
		<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
			<NativeSelect
				className="w-full sm:w-auto"
				aria-label="Sort by"
				value={values.sort ?? sortOptions[0]}
				onChange={(event) => {
					const value = event.target.value as Sort;
					onChange({ sort: value === sortOptions[0] ? undefined : value });
				}}
			>
				{sortOptions.map((sort) => (
					<NativeSelectOption key={sort} value={sort}>
						{SORT_LABELS[sort]}
					</NativeSelectOption>
				))}
			</NativeSelect>

			{showStatus && (
				<NativeSelect
					className="w-full sm:w-auto"
					aria-label="Status"
					value={values.status ?? ANY}
					onChange={(event) => {
						const value = event.target.value;
						onChange({ status: value === ANY ? undefined : (value as Status) });
					}}
				>
					<NativeSelectOption value={ANY}>Any status</NativeSelectOption>
					{Object.entries(STATUS_LABELS).map(([status, label]) => (
						<NativeSelectOption key={status} value={status}>
							{label}
						</NativeSelectOption>
					))}
				</NativeSelect>
			)}

			<NativeSelect
				className="w-full sm:w-auto"
				aria-label="Genre"
				value={values.genre ? String(values.genre) : ANY}
				onChange={(event) => onChange({ genre: toNumber(event.target.value) })}
			>
				<NativeSelectOption value={ANY}>All genres</NativeSelectOption>
				{genres?.genres.map((genre) => (
					<NativeSelectOption key={genre.id} value={String(genre.id)}>
						{genre.name}
					</NativeSelectOption>
				))}
			</NativeSelect>

			<NativeSelect
				className="w-full sm:w-auto"
				aria-label="Released from"
				value={values.from ? String(values.from) : ANY}
				onChange={(event) => onChange({ from: toNumber(event.target.value) })}
			>
				<NativeSelectOption value={ANY}>From any year</NativeSelectOption>
				{YEARS.map((year) => (
					<NativeSelectOption key={year} value={String(year)}>
						From {year}
					</NativeSelectOption>
				))}
			</NativeSelect>

			<NativeSelect
				className="w-full sm:w-auto"
				aria-label="Released until"
				value={values.to ? String(values.to) : ANY}
				onChange={(event) => onChange({ to: toNumber(event.target.value) })}
			>
				<NativeSelectOption value={ANY}>To any year</NativeSelectOption>
				{YEARS.map((year) => (
					<NativeSelectOption key={year} value={String(year)}>
						To {year}
					</NativeSelectOption>
				))}
			</NativeSelect>

			{showRating && (
				<NativeSelect
					className="w-full sm:w-auto"
					aria-label="Minimum rating"
					value={values.rating ? String(values.rating) : ANY}
					onChange={(event) =>
						onChange({ rating: toNumber(event.target.value) })
					}
				>
					<NativeSelectOption value={ANY}>Any rating</NativeSelectOption>
					{RATINGS.map((rating) => (
						<NativeSelectOption key={rating} value={String(rating)}>
							{rating}+ ★
						</NativeSelectOption>
					))}
				</NativeSelect>
			)}

			{hasFilters && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					className="col-span-2 justify-self-start sm:col-span-1"
				>
					<X />
					Clear
				</Button>
			)}
		</div>
	);
}
