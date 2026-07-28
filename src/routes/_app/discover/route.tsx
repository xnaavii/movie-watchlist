import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/discover")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col gap-8 md:gap-10 lg:gap-12 p-4 md:p-6 lg:p-8 mt-12 md:mt-0">
			<Outlet />
		</div>
	);
}
