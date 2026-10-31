import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRef } from "react";
import { RouteProgress } from "#/components/RouteProgress";
import { Sidebar } from "#/components/Sidebar";
import { SkipLink } from "#/components/SkipLink";
import { TabBar } from "#/components/TabBar";
import { TopBar } from "#/components/TopBar";
import { SiteFooter } from "#/features/legal/components/SiteFooter";
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
		<div className="grid grid-cols-1 max-md:content-start md:grid-cols-[auto_minmax(0,1fr)] min-h-svh">
			<SkipLink targetId="main-scrollable-area" />
			<AuthStateSync />
			<RouteProgress />
			<Sidebar />
			<TopBar />
			{/* Fixed to the bottom on phones, but before the content in the DOM so
			    keyboard users reach it without tabbing through the whole page. */}
			<TabBar />
			{/* tabIndex lets the skip link and route changes focus the content, which
			    also makes arrow keys and Space scroll it. */}
			<main
				ref={mainRef}
				// Leaves room for the tab bar and the notch in the installed app.
				className="relative min-w-0 outline-none standalone:pt-[env(safe-area-inset-top)] md:pt-0 pb-(--tab-bar-space)"
				id="main-scrollable-area"
				tabIndex={-1}
			>
				<Outlet />
				<SiteFooter />
			</main>
		</div>
	);
}
