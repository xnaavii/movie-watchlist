import { getRouteApi } from "@tanstack/react-router";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

const CURRENT_YEAR = new Date().getFullYear();
const RELEASE_YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i);
const ALL_YEARS_VALUE = "all";

const routeApi = getRouteApi("/_app/discover");

export function YearFilter() {
	const { year } = routeApi.useSearch();
	const navigate = routeApi.useNavigate();

	return (
		<Select
			value={year ? String(year) : ALL_YEARS_VALUE}
			onValueChange={(value) =>
				navigate({
					search: (prev) => ({
						...prev,
						year: value === ALL_YEARS_VALUE ? undefined : Number(value),
					}),
				})
			}
		>
			<SelectTrigger>
				<SelectValue placeholder="Year" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ALL_YEARS_VALUE}>All Years</SelectItem>
				{RELEASE_YEARS.map((y) => (
					<SelectItem key={y} value={String(y)}>
						{y}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
