import { cn } from "#/lib/utils";

interface BrandMarkProps {
	className?: string;
}

/** The Watchlist logo: a bookmark with a play button cut out of it. */
export function BrandMark({ className }: BrandMarkProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className={cn("size-4 shrink-0 text-sidebar-primary", className)}
		>
			<path
				fillRule="evenodd"
				d="M7.25 2h9.5A2.75 2.75 0 0 1 19.5 4.75V20.9a1 1 0 0 1-1.6.8L12 17.35l-5.9 4.35a1 1 0 0 1-1.6-.8V4.75A2.75 2.75 0 0 1 7.25 2Zm2.5 4.9v6.2a.7.7 0 0 0 1.06.6l5.02-3.1a.7.7 0 0 0 0-1.2L10.81 6.3a.7.7 0 0 0-1.06.6Z"
			/>
		</svg>
	);
}
