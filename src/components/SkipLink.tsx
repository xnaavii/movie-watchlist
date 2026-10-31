import { cn } from "#/lib/utils";

interface SkipLinkProps {
	/** id of the element to jump to; it needs tabIndex={-1} to take focus. */
	targetId: string;
	className?: string;
}

/** First stop for keyboard users: jumps past the navigation to the content. */
export function SkipLink({ targetId, className }: SkipLinkProps) {
	return (
		<a
			href={`#${targetId}`}
			onClick={(event) => {
				// Focus directly instead of following the hash, so the URL stays clean.
				const target = document.getElementById(targetId);
				if (!target) return;
				event.preventDefault();
				target.focus();
			}}
			className={cn(
				"sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background",
				className,
			)}
		>
			Skip to content
		</a>
	);
}
