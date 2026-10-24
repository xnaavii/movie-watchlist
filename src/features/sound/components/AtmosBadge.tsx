import { AudioLines } from "lucide-react";
import { cn } from "#/lib/utils";

type AtmosBadgeProps = {
	className?: string;
};

export function AtmosBadge({ className }: AtmosBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border bg-background/80 backdrop-blur px-2.5 py-1 text-xs font-medium",
				className,
			)}
		>
			<AudioLines className="size-3.5" aria-hidden="true" />
			Dolby Atmos
		</span>
	);
}
