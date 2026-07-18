import { useCallback, useEffect, useRef, useState } from "react";

export function useInfiniteScrollTrigger(
	onIntersect: () => void,
	enabled: boolean,
) {
	const [node, setNode] = useState<HTMLDivElement | null>(null);
	const onIntersectRef = useRef(onIntersect);

	useEffect(() => {
		onIntersectRef.current = onIntersect;
	});

	const ref = useCallback((el: HTMLDivElement | null) => {
		setNode(el);
	}, []);

	useEffect(() => {
		if (!enabled || !node) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) onIntersectRef.current();
			},
			{ rootMargin: "800px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [enabled, node]);

	return ref;
}
