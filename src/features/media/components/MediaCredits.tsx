import type { MovieCredits as MediaCreditsData } from "@lorenzopant/tmdb";
import type { MediaPerson } from "../types";

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
	const topCast = credits.cast.slice(0, 5);

	return (
		<>
			{leads.length > 0 && (
				<div className="flex gap-1 items-center justify-center md:justify-start">
					<p className="text-muted-foreground">{leadLabel}</p>
					<p>{leads.join(", ")}</p>
				</div>
			)}
			{topCast.length > 0 && (
				<div className="flex gap-1 items-center justify-center md:justify-start flex-wrap">
					<p className="text-muted-foreground">Starring</p>
					{topCast.map((cast, i) => (
						<p key={cast.id}>
							{cast.name}
							{topCast.length > i + 1 ? "," : null}
						</p>
					))}
				</div>
			)}
		</>
	);
}
