import type { Genre } from "@lorenzopant/tmdb";
import { Dot } from "lucide-react";

type GenresProps = {
	genres: Genre[];
};

export function Genres({ genres }: GenresProps) {
	return (
		<div className="flex gap-2 items-center">
			{genres.map((genre, i) => (
				<div className="flex gap-2 items-center" key={genre.id}>
					<span className="text-sm">{genre.name}</span>
					{genres.length > i + 1 ? (
						<Dot className="text-muted-foreground" />
					) : null}
				</div>
			))}
		</div>
	);
}
