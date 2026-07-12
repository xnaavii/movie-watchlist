import { AspectRatio } from "#/components/ui/aspect-ratio";

export function TrailerSectionSkeleton() {
	const skeletonItems = Array.from({ length: 2 }, (_, i) => ({
		id: i,
	}));

	return (
		<section className="flex flex-col gap-6 p-6">
			<div className="h-9.5 w-48 bg-muted animate-pulse rounded-4xl" />
			<div className="flex gap-4 w-full overflow-x-auto scrollbar-none snap-x snap-mandatory">
				{skeletonItems.map((item) => (
					<div
						key={item.id}
						className="w-full max-w-5xl rounded-4xl bg-muted overflow-hidden snap-start shrink-0 animate-pulse"
					>
						<AspectRatio ratio={16 / 9}></AspectRatio>
					</div>
				))}
			</div>
		</section>
	);
}
