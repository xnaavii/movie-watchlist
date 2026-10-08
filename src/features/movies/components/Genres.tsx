import type { Genre } from "@lorenzopant/tmdb";
import { Dot } from "lucide-react";
import { cn } from "#/lib/utils";

type GenresProps = {
	genres: Genre[];
	className?: string;
};

export function Genres({ genres, className }: GenresProps) {
	return (
		<div className={cn("flex items-center flex-wrap", className)}>
			{genres.map((genre, i) => (
				<div className="flex items-center" key={genre.id}>
					<span className="text-medium text-sm md:text-base">{genre.name}</span>
					{genres.length > i + 1 ? (
						<Dot className="text-muted-foreground" />
					) : null}
				</div>
			))}
		</div>
	);
}
