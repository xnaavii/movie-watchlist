import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Button } from "#/components/ui/button";
import { SITE_CONFIG } from "#/config/site";
import { OfflineBanner } from "#/features/pwa/OfflineBanner";
import { ServiceWorkerSetup } from "#/features/pwa/ServiceWorkerSetup";
import { seo } from "#/utils/seo";
import { Toaster } from "@/components/ui/sonner";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				// viewport-fit=cover lets the layout use the safe-area insets
				// (notch, home indicator) when installed.
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{ name: "theme-color", content: "#0a0a0a" },
			{ name: "mobile-web-app-capable", content: "yes" },
			{ name: "apple-mobile-web-app-capable", content: "yes" },
			{ name: "apple-mobile-web-app-status-bar-style", content: "black" },
			{ name: "apple-mobile-web-app-title", content: SITE_CONFIG.name },
			...seo({
				title: SITE_CONFIG.name,
				description: SITE_CONFIG.description,
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico", sizes: "any" },
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
			{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
			{ rel: "manifest", href: "/manifest.json" },
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFoundPage,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				{/* On phones, toasts sit above the tab bar instead of behind it. */}
				<Toaster
					mobileOffset={{
						bottom: "calc(4.5rem + env(safe-area-inset-bottom))",
					}}
				/>
				<OfflineBanner />
				<ServiceWorkerSetup />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						{ name: "Tanstack Form", render: <FormDevtoolsPanel /> },
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 h-svh text-center px-4">
			<h1 className="text-6xl font-semibold tracking-tighter">404</h1>
			<p className="text-muted-foreground">This page doesn't exist.</p>
			<Button asChild>
				<Link to="/discover">Go home</Link>
			</Button>
		</div>
	);
}
