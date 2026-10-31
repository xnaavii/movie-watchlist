declare const __BUILD_ID__: string;

/** Registers the offline service worker in production builds. */
export function registerServiceWorker() {
	if (import.meta.env.DEV || !("serviceWorker" in navigator)) return;
	const register = () =>
		// A new URL each build makes the browser install the new worker, which
		// then saves the new build's files.
		navigator.serviceWorker
			.register(`/sw.js?build=${__BUILD_ID__}`)
			.catch((error) => {
				console.warn("Service worker registration failed", error);
			});
	// Wait for the page to finish loading so caching doesn't compete with it.
	if (document.readyState === "complete") register();
	else window.addEventListener("load", register, { once: true });
}

/** Drops cached pages and data so one account's data isn't shown to another. */
export function clearCachedUserData() {
	navigator.serviceWorker?.controller?.postMessage({ type: "clear-user-data" });
}
