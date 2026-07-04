import { MovieCardSkeleton } from "./MovieCardSkeleton";

export function MoviesSectionSkeleton() {
	const skeletonItems = Array.from({ length: 10 }, (_, i) => ({
		id: i,
	}));
	return (
		<div className="flex flex-col gap-4">
			<div className="h-8 w-48 bg-muted animate-pulse rounded" />

			<ul className="flex gap-2 overflow-x-hidden">
				{skeletonItems.map((item) => (
					<li key={item.id} className="w-37.5 sm:w-50 shrink-0">
						<MovieCardSkeleton />
					</li>
				))}
			</ul>
		</div>
	);
}
