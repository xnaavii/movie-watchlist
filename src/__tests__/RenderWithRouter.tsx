import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { act, render } from "@testing-library/react";
import type { ReactElement } from "react";

export async function renderWithRouter(ui: ReactElement) {
	const rootRoute = createRootRoute();
	const testRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => ui,
	});

	const router = createRouter({
		routeTree: rootRoute.addChildren([testRoute]),
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});

	await router.load();

	let result!: ReturnType<typeof render>;
	await act(async () => {
		result = render(<RouterProvider router={router} />);
	});

	return result;
}
