import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Link,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { useRouteFocus } from "./useRouteFocus";

function Layout() {
	const mainRef = useRef<HTMLElement>(null);
	useRouteFocus(mainRef);
	return (
		<>
			<nav>
				<Link to="/search">Nav to search</Link>
			</nav>
			<main ref={mainRef} tabIndex={-1}>
				<Outlet />
			</main>
		</>
	);
}

async function setup() {
	const rootRoute = createRootRoute({ component: Layout });
	const a = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => <Link to="/search">Open search</Link>,
	});
	const b = createRoute({
		getParentRoute: () => rootRoute,
		path: "/search",
		component: () => <Link to="/">Back home</Link>,
	});
	const router = createRouter({
		routeTree: rootRoute.addChildren([a, b]),
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});
	await router.load();
	await act(async () => {
		render(<RouterProvider router={router} />);
	});
	return router;
}

describe("useRouteFocus", () => {
	it("moves focus to the content when the clicked link goes away", async () => {
		const user = userEvent.setup();
		await setup();

		await user.click(screen.getByRole("link", { name: "Open search" }));
		await screen.findByRole("link", { name: "Back home" });

		expect(screen.getByRole("main")).toHaveFocus();
	});

	it("leaves focus alone when the focused link is still on the page", async () => {
		const user = userEvent.setup();
		await setup();

		await user.click(screen.getByRole("link", { name: "Nav to search" }));
		await screen.findByRole("link", { name: "Back home" });

		expect(screen.getByRole("link", { name: "Nav to search" })).toHaveFocus();
	});
});
