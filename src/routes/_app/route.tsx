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
		// status bar on iOS scrolls to the top. The shell is at least one
		// screen tall and <main> fills it, so the footer sits at the bottom
		// even when the page is short.
		<div className="flex min-h-dvh flex-col md:grid md:grid-cols-[auto_minmax(0,1fr)]">
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
				className="relative flex min-w-0 flex-1 flex-col outline-none standalone:pt-[env(safe-area-inset-top)] md:pt-0 pb-(--tab-bar-space)"
				id="main-scrollable-area"
				tabIndex={-1}
			>
				{/* Grows to push the footer down. A plain block, so pages lay out as
				    they would directly inside <main>. */}
				<div className="flex-1">
					<Outlet />
				</div>
				<SiteFooter />
			</main>
		</div>
	);
}
