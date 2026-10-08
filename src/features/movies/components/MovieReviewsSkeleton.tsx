export function MovieReviewsSkeleton() {
	const skeletonItems = Array.from({ length: 4 }, (_, i) => ({ id: i }));

	return (
		<div className="flex flex-col gap-4">
			<div className="h-8 w-48 bg-muted animate-pulse rounded-4xl" />
			<ul className="flex gap-4 overflow-x-hidden">
				{skeletonItems.map((item) => (
					<li
						key={item.id}
						className="h-64 shrink-0 basis-[85%] sm:basis-1/2 lg:basis-1/3 2xl:basis-1/4 rounded-4xl bg-muted animate-pulse"
					/>
				))}
			</ul>
		</div>
	);
}
