import { useQuery } from "@tanstack/react-query";
import { Star, X } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
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
			<Select
				value={values.sort ?? sortOptions[0]}
				onValueChange={(value) =>
					onChange({
						sort: value === sortOptions[0] ? undefined : (value as Sort),
					})
				}
			>
				<SelectTrigger className="w-full sm:w-auto" aria-label="Sort by">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{sortOptions.map((sort) => (
						<SelectItem key={sort} value={sort}>
							{SORT_LABELS[sort]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{showStatus && (
				<Select
					value={values.status ?? ANY}
					onValueChange={(value) =>
						onChange({ status: value === ANY ? undefined : (value as Status) })
					}
				>
					<SelectTrigger className="w-full sm:w-auto" aria-label="Status">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ANY}>Any status</SelectItem>
						{Object.entries(STATUS_LABELS).map(([status, label]) => (
							<SelectItem key={status} value={status}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			<Select
				value={values.genre ? String(values.genre) : ANY}
				onValueChange={(value) => onChange({ genre: toNumber(value) })}
			>
				<SelectTrigger className="w-full sm:w-auto" aria-label="Genre">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ANY}>All genres</SelectItem>
					{genres?.genres.map((genre) => (
						<SelectItem key={genre.id} value={String(genre.id)}>
							{genre.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={values.from ? String(values.from) : ANY}
				onValueChange={(value) => onChange({ from: toNumber(value) })}
			>
				<SelectTrigger className="w-full sm:w-auto" aria-label="Released from">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ANY}>From any year</SelectItem>
					{YEARS.map((year) => (
						<SelectItem key={year} value={String(year)}>
							From {year}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={values.to ? String(values.to) : ANY}
				onValueChange={(value) => onChange({ to: toNumber(value) })}
			>
				<SelectTrigger className="w-full sm:w-auto" aria-label="Released until">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ANY}>To any year</SelectItem>
					{YEARS.map((year) => (
						<SelectItem key={year} value={String(year)}>
							To {year}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{showRating && (
				<Select
					value={values.rating ? String(values.rating) : ANY}
					onValueChange={(value) => onChange({ rating: toNumber(value) })}
				>
					<SelectTrigger className="w-full sm:w-auto" aria-label="Minimum rating">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ANY}>Any rating</SelectItem>
						{RATINGS.map((rating) => (
							<SelectItem key={rating} value={String(rating)}>
								<span className="flex items-center gap-1.5">
									{rating}+ <Star className="size-3.5 fill-current" />
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
