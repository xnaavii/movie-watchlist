import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "#/components/Navbar";
import { Sidebar } from "#/components/Sidebar";

export const Route = createFileRoute("/_app")({
	component: AppLayout,
});

function AppLayout() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-[auto_1fr] h-svh overflow-hidden ">
			<Navbar />
			<Sidebar />
			<main className="overflow-y-auto min-h-0" id="main-scrollable-area">
				<Outlet />
			</main>
		</div>
	);
}
