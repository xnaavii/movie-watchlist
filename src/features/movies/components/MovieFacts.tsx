import type { MovieDetails } from "@lorenzopant/tmdb";
import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "../queries";
import { formatLanguage, formatRuntime, formatUsd } from "../utils/format";

const releaseDateFormat = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

interface MovieFactsProps {
	movie: MovieDetails;
}

export function MovieFacts({ movie }: MovieFactsProps) {
	const { data: directors } = useQuery({
		...movieQueries.credits({ movie_id: movie.id }),
		select: (credits) =>
			credits.crew
				.filter((member) => member.job === "Director")
				.map((member) => member.name),
	});

	const facts = [
		{
			label: directors && directors.length > 1 ? "Directors" : "Director",
			value: directors?.join(", "),
		},
		{
			label: "Release date",
			value: movie.release_date
				? releaseDateFormat.format(new Date(movie.release_date))
				: null,
		},
		{ label: "Runtime", value: formatRuntime(movie.runtime) },
		{ label: "Status", value: movie.status },
		{
			label: "Original language",
			value: formatLanguage(movie.original_language),
		},
		{ label: "Budget", value: formatUsd(movie.budget) },
		{ label: "Box office", value: formatUsd(movie.revenue) },
	].filter((fact) => Boolean(fact.value));

	if (facts.length === 0) return null;

	return (
		<section className="flex flex-col gap-6">
			<h2 className="text-2xl tracking-tighter">Details</h2>
			{movie.tagline && (
				<p className="text-lg italic text-muted-foreground">
					&ldquo;{movie.tagline}&rdquo;
				</p>
			)}
			<dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
				{facts.map((fact) => (
					<div key={fact.label} className="flex flex-col gap-1">
						<dt className="text-sm text-muted-foreground">{fact.label}</dt>
						<dd className="font-medium">{fact.value}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
