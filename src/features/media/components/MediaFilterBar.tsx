import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	NativeSelect,
	NativeSelectOption,
} from "#/components/ui/native-select";
import { mediaQueries } from "../queries";
import type { MediaType } from "../types";
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

const TYPE_LABELS: Record<MediaType, string> = {
	movie: "Movies",
	tv: "TV shows",
};

type Sort = SearchSort | WatchlistSort;
type Status = keyof typeof STATUS_LABELS;

export type MediaFilterValues = {
	type?: MediaType;
	genre?: number;
	from?: number;
	to?: number;
	rating?: number;
	status?: Status;
	sort?: Sort;
};

type MediaFilterBarProps = {
	values: MediaFilterValues;
	sortOptions: readonly Sort[];
	showRating?: boolean;
	showStatus?: boolean;
	onChange: (patch: MediaFilterValues) => void;
	onClear: () => void;
};

function toNumber(value: string) {
	return value === ANY ? undefined : Number(value);
}

export function MediaFilterBar({
	values,
	sortOptions,
	showRating = false,
	showStatus = false,
	onChange,
	onClear,
}: MediaFilterBarProps) {
	const { data: movieGenres } = useQuery(mediaQueries.genres("movie"));
	const { data: tvGenres } = useQuery(mediaQueries.genres("tv"));
	const genres = mergeGenres(
		values.type === "tv" ? [] : (movieGenres?.genres ?? []),
		values.type === "movie" ? [] : (tvGenres?.genres ?? []),
	);
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

			<NativeSelect
				className="w-full sm:w-auto"
				aria-label="Type"
				value={values.type ?? ANY}
				onChange={(event) => {
					const value = event.target.value;
					// Movie and TV genres differ, so switching type resets the genre.
					onChange({
						type: value === ANY ? undefined : (value as MediaType),
						genre: undefined,
					});
				}}
			>
				<NativeSelectOption value={ANY}>Movies and TV</NativeSelectOption>
				{Object.entries(TYPE_LABELS).map(([type, label]) => (
					<NativeSelectOption key={type} value={type}>
						{label}
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
				{genres.map((genre) => (
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

/** One list of genres, without the names movies and TV share twice. */
function mergeGenres(
	...lists: { id: number; name: string }[][]
): { id: number; name: string }[] {
	const byId = new Map(lists.flat().map((genre) => [genre.id, genre]));
	return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}
