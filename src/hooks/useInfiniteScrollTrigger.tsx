import { useEffect, useRef } from "react";

export function useInfiniteScrollTrigger(
	onIntersect: () => void,
	enabled: boolean,
) {
	const ref = useRef<HTMLDivElement>(null);
	const onIntersectRef = useRef(onIntersect);

	useEffect(() => {
		onIntersectRef.current = onIntersect;
	});

	useEffect(() => {
		if (!enabled || !ref.current) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) onIntersectRef.current();
			},
			{ rootMargin: "400px" },
		);
		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [enabled]);

	return ref;
}
