import { cn } from "#/lib/utils";

type RankBadgeProps = {
	rank: number;
	className?: string;
};

export function RankBadge({ rank, className }: RankBadgeProps) {
	return (
		<div
			className={cn(
				"shrink-0 w-10 sm:w-12 lg:w-20 text-center tracking-tighter text-5xl md:text-6xl lg:text-8xl font-medium select-none",
				rank <= 3 ? "text-foreground" : "text-muted-foreground",
				className,
			)}
		>
			{rank}
		</div>
	);
}
