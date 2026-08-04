import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/discover")({
	component: DiscoverLayout,
});

function DiscoverLayout() {
	return (
		<div className="flex flex-col gap-8 md:gap-12 lg:gap-16 p-4 md:p-6 lg:p-8 mt-12 md:mt-0 min-h-screen">
			<Outlet />
		</div>
	);
}
