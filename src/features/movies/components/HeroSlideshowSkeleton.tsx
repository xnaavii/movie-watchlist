import { Skeleton } from "#/components/ui/skeleton";

export function HeroSlideshowSkeleton() {
	return (
		<div className="relative bg-black min-h-150 h-[60vh] overflow-hidden">
			<Skeleton className="size-full rounded-none" />
			<div className="absolute inset-0 max-w-2xl p-6 flex flex-col gap-4 justify-end z-9">
				<Skeleton className="h-10 w-3/4" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-9 w-40" />
					<Skeleton className="h-9 w-24" />
				</div>
			</div>
		</div>
	);
}
