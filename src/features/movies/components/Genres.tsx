import type { Genre } from "@lorenzopant/tmdb";
import { Dot } from "lucide-react";

type GenresProps = {
	genres: Genre[];
};

export function Genres({ genres }: GenresProps) {
	return (
		<div className="flex items-center flex-wrap">
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
