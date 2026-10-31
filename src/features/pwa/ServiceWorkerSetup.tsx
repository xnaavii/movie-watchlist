import { useEffect } from "react";
import { registerServiceWorker } from "./serviceWorker";

/** Renders nothing; registers the service worker once on the client. */
export function ServiceWorkerSetup() {
	useEffect(() => {
		registerServiceWorker();
	}, []);
	return null;
}
