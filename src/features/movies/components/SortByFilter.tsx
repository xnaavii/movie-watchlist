import { getRouteApi } from "@tanstack/react-router";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

const routeApi = getRouteApi("/discover");

const SORT_OPTIONS = [
	{ value: "popularity.desc", label: "Most Popular" },
	{ value: "vote_average.desc", label: "Highest Rated (TMDB)" },
	{ value: "primary_release_date.desc", label: "Newest" },
	{ value: "revenue.desc", label: "Highest Grossing" },
] as const;

export function SortByFilter() {
	const { sortBy } = routeApi.useSearch();
	const navigate = routeApi.useNavigate();

	return (
		<Select
			value={sortBy ?? "popularity.desc"}
			onValueChange={(value) =>
				navigate({
					search: (prev) => ({
						...prev,
						sortBy: value as (typeof SORT_OPTIONS)[number]["value"],
					}),
				})
			}
		>
			<SelectTrigger>
				<SelectValue placeholder="Sort by" />
			</SelectTrigger>
			<SelectContent>
				{SORT_OPTIONS.map((opt) => (
					<SelectItem key={opt.value} value={opt.value}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
