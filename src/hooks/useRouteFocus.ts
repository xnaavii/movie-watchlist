import { useRouter } from "@tanstack/react-router";
import { type RefObject, useEffect } from "react";

/**
 * After a client-side navigation, moves focus to `target` when the element
 * that had it is gone (the clicked link was part of the old page). Without
 * this, focus falls back to <body> and the next Tab starts from the top.
 */
export function useRouteFocus(target: RefObject<HTMLElement | null>) {
	const router = useRouter();

	useEffect(
		() =>
			router.subscribe("onRendered", (event) => {
				if (!event.fromLocation || !event.pathChanged) return;

				const active = document.activeElement;
				const lost = !active || active === document.body || !active.isConnected;
				if (lost) target.current?.focus({ preventScroll: true });
			}),
		[router, target],
	);
}
