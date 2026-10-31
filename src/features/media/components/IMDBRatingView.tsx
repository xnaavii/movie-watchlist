import { useQuery } from "@tanstack/react-query";
import { mediaQueries } from "../queries";
import { IMDBRating } from "./IMDBRating";

interface IMDBRatingViewProps {
	imdbId?: string;
}

export function IMDBRatingView({ imdbId }: IMDBRatingViewProps) {
	const { data: rating, isLoading } = useQuery(
		mediaQueries.imdbRating(imdbId ?? ""),
	);

	if (isLoading) {
		return <span className="bg-muted animate-pulse w-24 h-5 rounded"></span>;
	}

	if (!rating) {
		return null;
	}

	return <IMDBRating rating={rating.imdbRating} />;
}
