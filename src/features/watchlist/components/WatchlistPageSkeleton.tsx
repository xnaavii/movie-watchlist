import { MEDIA_GRID_CLASS } from "#/features/media/components/MediaGrid";

export function WatchlistPageSkeleton() {
	const skeletonItems = Array.from({ length: 10 }, (_, i) => ({
		id: i,
	}));
	return (
		<div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 animate-pulse">
			<div className="h-8 w-48 bg-muted rounded" />
			<div className={MEDIA_GRID_CLASS}>
				{skeletonItems.map((item) => (
					<div key={item.id} className="aspect-2/3 bg-muted rounded-lg" />
				))}
			</div>
		</div>
	);
}
