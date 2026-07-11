import { Clapperboard } from "lucide-react";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#/components/ui/empty";

export function TrailerSectionEmpty() {
	return (
		<div className="w-full max-w-5xl rounded-4xl bg-muted overflow-hidden shrink-0">
			<AspectRatio ratio={16 / 9}>
				<Empty className="size-full">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Clapperboard />
						</EmptyMedia>
						<EmptyTitle>No trailer available</EmptyTitle>
						<EmptyDescription>
							We couldn&apos;t find a trailer for this title.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</AspectRatio>
		</div>
	);
}
