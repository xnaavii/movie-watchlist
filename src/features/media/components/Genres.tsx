import type { Genre } from "@lorenzopant/tmdb";
import { Dot } from "lucide-react";
import { cn } from "#/lib/utils";

type GenresProps = {
	genres: Genre[];
	className?: string;
};

/**
 * Movie and TV genre lists share some genres (Mystery has the same id in
 * both), so a merged list can repeat a name. Show each name once.
 */
export function uniqueGenres(genres: Genre[]) {
	const seen = new Set<string>();
	return genres.filter((genre) => {
		if (seen.has(genre.name)) return false;
		seen.add(genre.name);
		return true;
	});
}

export function Genres({ genres: allGenres, className }: GenresProps) {
	const genres = uniqueGenres(allGenres);
	return (
		<div className={cn("flex items-center flex-wrap", className)}>
			{genres.map((genre, i) => (
				<div className="flex items-center" key={genre.name}>
					<span className="text-medium text-sm md:text-base">{genre.name}</span>
					{genres.length > i + 1 ? (
						<Dot className="text-muted-foreground" />
					) : null}
				</div>
			))}
		</div>
	);
}
