import type { MovieDetails } from "@lorenzopant/tmdb";
import { useQuery } from "@tanstack/react-query";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { movieQueries } from "../queries";
import { TrailerSectionEmpty } from "./TrailerSectionEmpty";
import { TrailerSectionSkeleton } from "./TrailerSectionSkeleton";

type TrailerSectionProps = {
	movie: MovieDetails;
};

export function TrailerSection({ movie }: TrailerSectionProps) {
	const {
		data: videos,
		isPending,
		isError,
		error,
	} = useQuery(movieQueries.videos({ movie_id: movie.id }));

	if (isPending) {
		return <TrailerSectionSkeleton />;
	}

	if (isError)
		return (
			<div className="p-4 text-red-500">
				Error loading trailer {error.message}
			</div>
		);

	const trailer = videos?.results.find((v) => v.type === "Trailer");

	return (
		<section className="flex flex-col gap-6 p-6">
			<h2 className="text-3xl tracking-tight font-medium">Watch The Trailer</h2>
			{trailer ? (
				<div className="flex gap-4 w-full overflow-x-auto scrollbar-none snap-x snap-mandatory">
					<div className="w-full max-w-5xl rounded-4xl bg-muted overflow-hidden snap-start shrink-0">
						<AspectRatio ratio={16 / 9}>
							<iframe
								title={`${movie.title} Trailer`}
								className="size-full"
								allowFullScreen
								src={`https://www.youtube.com/embed/${trailer?.key}?autoplay=1&mute=1`}
							></iframe>
						</AspectRatio>
					</div>
				</div>
			) : (
				<TrailerSectionEmpty />
			)}
		</section>
	);
}
