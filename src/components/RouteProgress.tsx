import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * A thin line along the top while the next page loads, like a native app's
 * activity indicator. It waits a moment so fast navigations don't flash it.
 */
export function RouteProgress() {
	const isLoading = useRouterState({ select: (s) => s.status === "pending" });
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!isLoading) {
			setVisible(false);
			return;
		}
		const timerId = setTimeout(() => setVisible(true), 150);
		return () => clearTimeout(timerId);
	}, [isLoading]);

	if (!visible) return null;

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden [view-transition-name:route-progress]"
		>
			<div className="h-full w-1/3 animate-route-progress rounded-full bg-sidebar-primary" />
		</div>
	);
}
