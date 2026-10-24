import { useQuery } from "@tanstack/react-query";
import { mediaQueries } from "@/features/media/queries";
import type { MediaPerson, MediaRef } from "../types";
import { MediaCredits } from "./MediaCredits";

interface MediaCreditsViewProps {
	media: MediaRef;
	createdBy?: MediaPerson[];
}

export function MediaCreditsView({ media, createdBy }: MediaCreditsViewProps) {
	const {
		data: credits,
		isLoading,
		isError,
		error,
	} = useQuery(mediaQueries.credits(media));

	if (isLoading) {
		return <span className="bg-muted animate-pulse w-24 h-5 rounded"></span>;
	}

	if (isError) {
		return <p>{error.message ?? "There was error getting the credits."}</p>;
	}

	if (!credits) {
		return <p>There are no credits available for this title.</p>;
	}

	return <MediaCredits credits={credits} createdBy={createdBy} />;
}
