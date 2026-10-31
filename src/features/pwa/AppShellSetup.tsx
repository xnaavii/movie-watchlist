import { useEffect } from "react";
import { startAppShell } from "./appShellStore";

/** Keeps the app shell store in step with the display mode. */
export function AppShellSetup() {
	useEffect(() => startAppShell(), []);
	return null;
}
