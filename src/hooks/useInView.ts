import { useCallback, useEffect, useState } from "react";
import { getScrollParent } from "./useInfiniteScrollTrigger";

/**
 * Returns a ref and whether that element has come near the visible area.
 * It stays true once reached, so content mounted on view is kept afterwards.
 * Starts false on the server, so nothing gated by it renders there.
 */
export function useInView({ rootMargin = "600px" } = {}) {
	const [node, setNode] = useState<HTMLElement | null>(null);
	const [inView, setInView] = useState(false);

	const ref = useCallback((el: HTMLElement | null) => {
		setNode(el);
	}, []);

	useEffect(() => {
		if (!node || inView) return;
		if (typeof IntersectionObserver === "undefined") {
			setInView(true);
			return;
		}
		// The app scrolls inside <main>, not the window, so observe against the
		// nearest scroll container or the margin would be clipped away.
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) setInView(true);
			},
			{ root: getScrollParent(node), rootMargin },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [node, inView, rootMargin]);

	return { ref, inView };
}
