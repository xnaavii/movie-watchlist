import { useCallback, useEffect, useRef, useState } from "react";

type InfiniteScrollOptions = {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => unknown;
	/**
	 * Number of items shown. A new list (other filters or query) can leave the
	 * sentinel in view without a fresh intersection event, so a change re-checks.
	 */
	itemCount: number;
	/** Stops loading, e.g. after a failed page so it does not retry in a loop. */
	disabled?: boolean;
	/** How far ahead of the end to start loading the next page. */
	rootMargin?: string;
};

function getScrollParent(el: HTMLElement): HTMLElement | null {
	let parent = el.parentElement;
	while (parent) {
		const { overflowY } = getComputedStyle(parent);
		if (overflowY === "auto" || overflowY === "scroll") return parent;
		parent = parent.parentElement;
	}
	return null;
}

/**
 * Returns a ref for a sentinel element placed after a list. Loads the next
 * page whenever the sentinel is near the visible area, and keeps loading after
 * each page lands while it is still in view, so short pages never stall.
 */
export function useInfiniteScrollTrigger({
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	itemCount,
	disabled = false,
	rootMargin = "800px",
}: InfiniteScrollOptions) {
	const [node, setNode] = useState<HTMLElement | null>(null);
	const [isNearEnd, setIsNearEnd] = useState(false);
	const fetchNextPageRef = useRef(fetchNextPage);

	useEffect(() => {
		fetchNextPageRef.current = fetchNextPage;
	});

	const ref = useCallback((el: HTMLElement | null) => {
		setNode(el);
	}, []);

	useEffect(() => {
		if (!node) {
			setIsNearEnd(false);
			return;
		}
		// The app scrolls inside <main>, not the window, so observe against the
		// nearest scroll container or the margin would be clipped away.
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[entries.length - 1];
				if (entry) setIsNearEnd(entry.isIntersecting);
			},
			{ root: getScrollParent(node), rootMargin },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [node, rootMargin]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: itemCount is a re-check signal
	useEffect(() => {
		if (isNearEnd && hasNextPage && !isFetchingNextPage && !disabled) {
			fetchNextPageRef.current();
		}
	}, [isNearEnd, hasNextPage, isFetchingNextPage, disabled, itemCount]);

	return ref;
}
