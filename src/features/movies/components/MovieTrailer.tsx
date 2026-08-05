import { AspectRatio } from "#/components/ui/aspect-ratio";

type MovieTrailerProps = {
	trailerId: string;
	title: string;
	autoPlay?: boolean;
	mute?: boolean;
};

export function MovieTrailer({
	trailerId,
	title,
	autoPlay,
	mute,
}: MovieTrailerProps) {
	return (
		<div className="flex gap-4 w-full overflow-x-auto scrollbar-none snap-x snap-mandatory">
			<div className="w-full max-w-5xl rounded-4xl bg-muted overflow-hidden snap-start shrink-0">
				<AspectRatio ratio={16 / 9}>
					<iframe
						title={`${title} Trailer`}
						className="size-full"
						allowFullScreen
						src={`https://www.youtube.com/embed/${trailerId}?autoplay=${autoPlay ? 1 : 0}&mute=${mute ? 1 : 0}`}
					></iframe>
				</AspectRatio>
			</div>
		</div>
	);
}
