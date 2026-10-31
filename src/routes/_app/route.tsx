import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRef } from "react";
import { Navbar } from "#/components/Navbar";
import { Sidebar } from "#/components/Sidebar";
import { SkipLink } from "#/components/SkipLink";
import { AuthStateSync } from "#/features/watchlist/guest/AuthStateSync";
import { useRouteFocus } from "#/hooks/useRouteFocus";

export const Route = createFileRoute("/_app")({
	component: AppLayout,
});

function AppLayout() {
	const mainRef = useRef<HTMLElement>(null);
	useRouteFocus(mainRef);

	return (
		// The page scrolls the document, not an inner box, so tapping the
		// status bar on iOS scrolls to the top.
		<div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)] min-h-svh">
			<SkipLink targetId="main-scrollable-area" />
			<AuthStateSync />
			<Navbar />
			<Sidebar />
			{/* tabIndex lets the skip link and route changes focus the content, which
			    also makes arrow keys and Space scroll it. */}
			<main
				ref={mainRef}
				className="relative min-w-0 outline-none"
				id="main-scrollable-area"
				tabIndex={-1}
			>
				<Outlet />
			</main>
		</div>
	);
}
