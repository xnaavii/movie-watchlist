import type { MovieCredits as MediaCreditsData } from "@lorenzopant/tmdb";
import type { MediaPerson } from "../types";

/** The full cast has its own row further down the page. */
const HEADER_CAST = 3;

interface MediaCreditsProps {
	credits?: MediaCreditsData;
	/** TV shows credit their creators instead of a director. */
	createdBy?: MediaPerson[];
}

export function MediaCredits({ credits, createdBy }: MediaCreditsProps) {
	if (!credits) {
		return <p className="text-muted-foreground">No credits data available.</p>;
	}

	const leads = createdBy
		? createdBy.map((person) => person.name)
		: credits.crew
				.filter((member) => member.job === "Director")
				.map((member) => member.name);
	const leadLabel = createdBy
		? "Created by"
		: leads.length > 1
			? "Directors"
			: "Director";
	const topCast = credits.cast.slice(0, HEADER_CAST);

	return (
		<>
			{leads.length > 0 && (
				<p className="text-balance">
					<span className="text-muted-foreground">{leadLabel}</span>{" "}
					{leads.join(", ")}
				</p>
			)}
			{topCast.length > 0 && (
				<p className="text-balance">
					<span className="text-muted-foreground">Starring</span>{" "}
					{topCast.map((cast) => cast.name).join(", ")}
				</p>
			)}
		</>
	);
}
