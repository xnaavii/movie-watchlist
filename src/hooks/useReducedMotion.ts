import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
	if (typeof window === "undefined" || !window.matchMedia) return () => {};
	const media = window.matchMedia(QUERY);
	media.addEventListener("change", onChange);
	return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
	return typeof window !== "undefined" && !!window.matchMedia
		? window.matchMedia(QUERY).matches
		: false;
}

/** Whether the person asked their system for less motion. False on the server. */
export function useReducedMotion() {
	return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
