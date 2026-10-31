import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useState } from "react";
import { AspectRatio } from "#/components/ui/aspect-ratio";

type MediaTrailerProps = {
	trailerId: string;
	title: string;
	autoPlay?: boolean;
	mute?: boolean;
};

/**
 * YouTube's privacy-enhanced embed. It only stores data on the device once a
 * video plays, so the player loads when the viewer presses play. That keeps
 * the app free of non-essential storage, with no cookie banner needed.
 */
export function trailerEmbedUrl(
	trailerId: string,
	{
		autoPlay = true,
		mute = false,
	}: { autoPlay?: boolean; mute?: boolean } = {},
) {
	const params = new URLSearchParams({
		autoplay: autoPlay ? "1" : "0",
		mute: mute ? "1" : "0",
		rel: "0",
	});
	return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailerId)}?${params}`;
}

export function MediaTrailer({
	trailerId,
	title,
	autoPlay,
	mute,
}: MediaTrailerProps) {
	const [playing, setPlaying] = useState(false);

	return (
		<div className="flex gap-4 w-full overflow-x-auto scrollbar-none snap-x snap-mandatory">
			<div className="w-full max-w-5xl rounded-4xl bg-muted overflow-hidden snap-start shrink-0">
				<AspectRatio ratio={16 / 9}>
					{playing ? (
						<iframe
							title={`${title} Trailer`}
							className="size-full"
							allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
							allowFullScreen
							src={trailerEmbedUrl(trailerId, {
								autoPlay: autoPlay ?? true,
								mute,
							})}
						></iframe>
					) : (
						<div className="relative flex size-full flex-col items-center justify-center gap-4 bg-card p-6 text-center">
							<button
								type="button"
								onClick={() => setPlaying(true)}
								aria-label={`Play trailer for ${title}`}
								className="group flex flex-col items-center gap-3 rounded-4xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
							>
								<span className="flex size-16 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform group-hover:scale-105 group-active:scale-95 md:size-20">
									<Play className="size-7 translate-x-0.5 fill-current md:size-8" />
								</span>
								<span className="text-sm font-medium md:text-base">
									Play trailer
								</span>
							</button>
							<p className="absolute inset-x-0 bottom-4 px-6 text-xs text-muted-foreground">
								Plays from YouTube, which may store data on your device.{" "}
								<Link
									to="/cookies"
									className="underline underline-offset-4 hover:text-foreground"
								>
									Learn more
								</Link>
							</p>
						</div>
					)}
				</AspectRatio>
			</div>
		</div>
	);
}
