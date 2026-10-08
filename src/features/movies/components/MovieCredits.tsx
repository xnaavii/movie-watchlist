import type { MovieCredits as MovieCreditsData } from "@lorenzopant/tmdb";

export function MovieCredits({ credits }: { credits?: MovieCreditsData }) {
	if (!credits) {
		return <p className="text-muted-foreground">No credits data available.</p>;
	}

	const director = credits?.crew.find((m) => m.job === "Director");
	const topCast = credits?.cast.slice(0, 5);

	return (
		<>
			<div className="flex gap-1 items-center justify-center md:justify-start">
				<p className="text-muted-foreground">Director</p>
				<p>{director?.name}</p>
			</div>
			<div className="flex gap-1 items-center justify-center md:justify-start flex-wrap">
				<p className="text-muted-foreground">Starring</p>
				{topCast?.map((cast, i) => (
					<p key={cast.id}>
						{cast?.name}
						{topCast.length > i + 1 ? "," : null}
					</p>
				))}
			</div>
		</>
	);
}
