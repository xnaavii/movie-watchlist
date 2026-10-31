import type { ReactNode } from "react";
import { useInView } from "#/hooks/useInView";

interface LazySectionProps {
	children: ReactNode;
	/** Shown until the section scrolls near the visible area. */
	fallback: ReactNode;
	/** Skip the wait, e.g. when the section's data is already cached. */
	eager?: boolean;
}

/**
 * Renders its children only once they scroll near the visible area, so
 * sections far down a page don't fetch anything until someone gets there.
 */
export function LazySection({ children, fallback, eager }: LazySectionProps) {
	const { ref, inView } = useInView();

	if (eager || inView) return children;

	return <div ref={ref}>{fallback}</div>;
}
