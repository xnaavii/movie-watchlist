import { Link, useMatchRoute } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import { type NavItem, navItems } from "./nav/navItems";

function TabBarItem({ to, label, icon: Icon }: NavItem) {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ to, fuzzy: true });

	return (
		<li className="flex-1">
			<Link
				to={to}
				preload="intent"
				aria-current={isActive ? "page" : undefined}
				data-active={isActive}
				className="group/tab flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.6875rem] font-medium text-muted-foreground transition-colors data-[active=true]:text-foreground active:bg-muted/60 focus-visible:outline-offset-[-2px]"
			>
				<span
					className={cn(
						"flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200 group-active/tab:scale-90",
						"group-data-[active=true]/tab:bg-primary group-data-[active=true]/tab:text-primary-foreground",
					)}
				>
					<Icon className="size-5" aria-hidden="true" />
				</span>
				{label}
			</Link>
		</li>
	);
}

/** Bottom tab bar on phones, like a native app. Desktop uses the rail. */
export function TabBar() {
	return (
		<nav
			aria-label="Main"
			className="app-chrome fixed inset-x-0 bottom-0 z-40 border-t bg-background/80 px-[max(0.5rem,env(safe-area-inset-left))] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 md:hidden [view-transition-name:tab-bar]"
		>
			<ul className="mx-auto flex max-w-md items-stretch gap-1 py-1">
				{navItems.map((item) => (
					<TabBarItem key={item.to} {...item} />
				))}
			</ul>
		</nav>
	);
}
