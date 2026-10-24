import { Skeleton } from "#/components/ui/skeleton";

export function MediaCardSkeleton() {
	return (
		<Skeleton className="relative w-full aspect-2/3 rounded-4xl overflow-hidden bg-muted max-w-sm" />
	);
}
