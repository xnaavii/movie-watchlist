import { create } from "zustand";

/** Chromium's install event; not in the DOM typings yet. */
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** How this browser can install the app, if at all. */
export type InstallSupport = "prompt" | "ios" | null;

interface AppShellState {
	/**
	 * Whether Watchlist runs as an installed app (no browser chrome) or in a
	 * browser tab. Layout switches use the `standalone:` / `browser:` CSS
	 * variants so the server render is right; this is for logic in JS.
	 */
	isStandalone: boolean;
	installSupport: InstallSupport;
	/** Shows the browser's install prompt, where it has one. */
	install: () => Promise<void>;
}

const STANDALONE_QUERY = "(display-mode: standalone)";
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/** iPhone and iPad Safari have no install event; adding is done by hand. */
function isIos() {
	return (
		/iPhone|iPad|iPod/.test(navigator.userAgent) ||
		// iPadOS reports itself as a Mac.
		(navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
	);
}

function installSupport(isStandalone: boolean): InstallSupport {
	if (isStandalone) return null;
	if (deferredPrompt) return "prompt";
	return isIos() ? "ios" : null;
}

export const useAppShell = create<AppShellState>()((set, get) => ({
	isStandalone: false,
	installSupport: null,
	install: async () => {
		if (!deferredPrompt) return;
		const prompt = deferredPrompt;
		await prompt.prompt();
		await prompt.userChoice;
		deferredPrompt = null;
		set({ installSupport: installSupport(get().isStandalone) });
	},
}));

let started = false;
function sync() {
	if (!started) return;
	const isStandalone = window.matchMedia(STANDALONE_QUERY).matches;
	useAppShell.setState({
		isStandalone,
		installSupport: installSupport(isStandalone),
	});
}

// Catch the install event from the moment the module loads: it can fire
// before any component has mounted.
if (typeof window !== "undefined") {
	window.addEventListener("beforeinstallprompt", (event) => {
		event.preventDefault();
		deferredPrompt = event as BeforeInstallPromptEvent;
		sync();
	});
	window.addEventListener("appinstalled", () => {
		deferredPrompt = null;
		sync();
	});
}

/**
 * Starts tracking the display mode. Called after hydration (see
 * AppShellSetup) so the first client render matches the server's.
 */
export function startAppShell() {
	if (started) return () => {};
	started = true;
	const media = window.matchMedia(STANDALONE_QUERY);
	media.addEventListener("change", sync);
	sync();
	return () => {
		media.removeEventListener("change", sync);
		started = false;
	};
}
