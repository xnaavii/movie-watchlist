import { getRouteApi } from "@tanstack/react-router";
import { Star } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

const routeApi = getRouteApi("/discover");
const ANY_RATING_VALUE = "any";
const RATING_OPTIONS = [9, 8, 7, 6, 5];

export function MinRatingFilter() {
	const { minRating } = routeApi.useSearch();
	const navigate = routeApi.useNavigate();

	return (
		<Select
			value={minRating ? String(minRating) : ANY_RATING_VALUE}
			onValueChange={(value) =>
				navigate({
					search: (prev) => ({
						...prev,
						minRating: value === ANY_RATING_VALUE ? undefined : Number(value),
					}),
				})
			}
		>
			<SelectTrigger>
				<SelectValue placeholder="Rating" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ANY_RATING_VALUE}>Any Rating</SelectItem>
				{RATING_OPTIONS.map((rating) => (
					<SelectItem key={rating} value={String(rating)}>
						<div className="flex items-center justify-between w-full gap-2">
							<span>{rating}+</span>
							<Star className="size-3.5 fill-current" />
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
