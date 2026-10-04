import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Container } from "#/components/Container";

export const Route = createFileRoute("/_app/discover")({
	component: DiscoverLayout,
});

function DiscoverLayout() {
	return (
		<Container>
			<Outlet />
		</Container>
	);
}
