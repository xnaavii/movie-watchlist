import { Skeleton } from "#/components/ui/skeleton";

export default function MovieCardSkeleton() {
	return (
		<Skeleton className="relative w-full aspect-2/3 rounded-lg overflow-hidden bg-muted" />
	);
}
