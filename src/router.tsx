import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ErrorPage } from "./components/ErrorPage";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		// Preloading runs a page's loader, which costs Worker requests and TMDB
		// calls. Only the main nav links opt in, see NavIconButton.
		defaultPreload: false,
		defaultPreloadStaleTime: 0,
		scrollToTopSelectors: ["#main-scrollable-area"],
		defaultViewTransition: true,
		defaultErrorComponent: ErrorPage,
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
