import { useSuspenseQuery } from "@tanstack/react-query";
import { mediaQueries } from "../queries";
import type { MediaRef } from "../types";
import { MediaRow } from "./MediaRow";

interface RecommendedMediaProps {
	media: MediaRef;
}

export function RecommendedMediaView({ media }: RecommendedMediaProps) {
	const { data } = useSuspenseQuery(mediaQueries.recommendations(media));

	if (data.results.length === 0) return null;

	return (
		<section>
			<MediaRow
				header={
					<h2 className="text-2xl tracking-tighter">
						{media.mediaType === "tv"
							? "Shows you might also like"
							: "Similar movie recommendations"}
					</h2>
				}
				items={data.results}
			/>
		</section>
	);
}
