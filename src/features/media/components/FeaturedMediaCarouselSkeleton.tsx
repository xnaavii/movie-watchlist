import { Skeleton } from "#/components/ui/skeleton";

/** Same shape as the hero: a slide in the middle with its neighbours peeking out. */
export function FeaturedMediaCarouselSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div className="relative -mx-4 flex justify-center overflow-hidden py-1 md:-mx-6 lg:-mx-8">
				<Skeleton className="absolute top-1/2 right-[calc(50%+30%)] aspect-[4/5] w-[64%] -translate-y-1/2 opacity-40 sm:aspect-[16/11] sm:w-[60%] xl:aspect-video" />
				<Skeleton className="absolute top-1/2 left-[calc(50%+30%)] aspect-[4/5] w-[64%] -translate-y-1/2 opacity-40 sm:aspect-[16/11] sm:w-[60%] xl:aspect-video" />
				<div className="relative aspect-[4/5] max-h-[68svh] w-[76%] overflow-hidden rounded-xl bg-muted sm:aspect-[16/11] sm:min-h-[22rem] sm:max-h-[78svh] short:min-h-0 short:max-h-[calc(100svh-4.5rem)] sm:w-[72%] lg:w-[62%] xl:aspect-video xl:w-[58%]">
					<div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 md:p-6 lg:p-8">
						<Skeleton className="h-8 w-2/3 bg-background/40" />
						<Skeleton className="h-4 w-1/2 bg-background/40" />
						<div className="flex gap-2 pt-2">
							<Skeleton className="h-10 w-36 rounded-full bg-background/40" />
							<Skeleton className="h-10 w-24 rounded-full bg-background/40" />
						</div>
					</div>
				</div>
			</div>
			<div className="flex justify-center">
				<Skeleton className="h-1.5 w-40" />
			</div>
		</div>
	);
}
