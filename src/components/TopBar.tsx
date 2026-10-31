import { Link, useMatchRoute } from "@tanstack/react-router";
import { InstallButton } from "#/features/pwa/InstallButton";
import { BrandMark } from "./BrandMark";
import { type NavItem, navItems } from "./nav/navItems";
import { Button } from "./ui/button";

function TopBarItem({ to, label, icon: Icon }: NavItem) {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ to, fuzzy: true });

	return (
		<li>
			<Button size="icon" asChild variant={isActive ? "default" : "ghost"}>
				<Link
					to={to}
					preload="intent"
					aria-label={label}
					title={label}
					aria-current={isActive ? "page" : undefined}
				>
					<Icon className="size-4" aria-hidden="true" />
				</Link>
			</Button>
		</li>
	);
}

/**
 * The header in a phone browser, where the browser's own toolbar already
 * takes the bottom of the screen. The installed app uses the TabBar instead.
 */
export function TopBar() {
	return (
		<header className="app-chrome sticky top-0 z-30 flex items-center justify-between gap-2 border-b bg-background/80 px-[max(0.5rem,env(safe-area-inset-left))] py-2 backdrop-blur-xl backdrop-saturate-150 md:hidden standalone:hidden [view-transition-name:top-bar]">
			<Link
				to="/discover"
				aria-label="Watchlist home"
				className="flex items-center gap-2 rounded-full px-1 font-semibold tracking-tight"
			>
				<BrandMark className="size-5" />
				<span className="max-[380px]:sr-only">Watchlist</span>
			</Link>
			<div className="flex items-center gap-1.5">
				<InstallButton />
				<nav aria-label="Main">
					<ul className="flex items-center gap-0.5">
						{navItems.map((item) => (
							<TopBarItem key={item.to} {...item} />
						))}
					</ul>
				</nav>
			</div>
		</header>
	);
}
