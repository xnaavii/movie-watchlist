import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
	document.addEventListener("visibilitychange", onChange);
	return () => document.removeEventListener("visibilitychange", onChange);
}

function getSnapshot() {
	return document.visibilityState !== "hidden";
}

/** Whether the tab is in front. True on the server. */
export function usePageVisible() {
	return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
