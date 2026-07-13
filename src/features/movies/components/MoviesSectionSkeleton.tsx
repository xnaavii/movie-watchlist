import { MovieCardSkeleton } from "./MovieCardSkeleton";

export function MoviesSectionSkeleton() {
	const skeletonItems = Array.from({ length: 10 }, (_, i) => ({
		id: i,
	}));
	return (
		<div className="flex flex-col gap-6">
			<div className="h-8 w-48 bg-muted animate-pulse rounded-4xl" />

			<ul className="flex gap-2.5 overflow-x-hidden">
				{skeletonItems.map((item) => (
					<li key={item.id} className="w-full max-w-3xs md:max-w-2xs shrink-0">
						<MovieCardSkeleton />
					</li>
				))}
			</ul>
		</div>
	);
}
