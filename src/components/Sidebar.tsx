import { Link, useMatchRoute } from "@tanstack/react-router";
import { InstallButton } from "#/features/pwa/InstallButton";
import { cn } from "#/lib/utils";
import { BrandMark } from "./BrandMark";
import { type NavItem, navItems } from "./nav/navItems";

type SidebarProps = {
	className?: string;
};

function RailItem({ to, label, icon: Icon }: NavItem) {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ to, fuzzy: true });

	return (
		<li>
			<Link
				to={to}
				preload="intent"
				aria-current={isActive ? "page" : undefined}
				data-active={isActive}
				className="group/rail flex w-16 flex-col items-center gap-1 rounded-2xl py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground"
			>
				<span className="flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 group-hover/rail:bg-muted group-active/rail:scale-90 group-data-[active=true]/rail:bg-primary group-data-[active=true]/rail:text-primary-foreground">
					<Icon className="size-5" aria-hidden="true" />
				</span>
				{label}
			</Link>
		</li>
	);
}

/** The navigation rail on tablets and desktops. Phones use the tab bar. */
export function Sidebar({ className }: SidebarProps) {
	return (
		<aside
			className={cn(
				"app-chrome sticky top-0 h-svh py-4 short:py-2 px-2 hidden md:flex flex-col justify-between items-center bg-sidebar/30 backdrop-blur-3xl [view-transition-name:nav-rail]",
				className,
			)}
		>
			<Link
				to="/discover"
				aria-label="Home"
				className="flex size-10 items-center justify-center rounded-full hover:bg-muted"
			>
				<BrandMark className="size-5" />
			</Link>
			<nav aria-label="Main">
				<ul className="flex flex-col items-center gap-5 short:gap-1">
					{navItems.map((item) => (
						<RailItem key={item.to} {...item} />
					))}
				</ul>
			</nav>
			{/* Install in a browser tab; otherwise an empty slot that balances the
			    logo so the nav stays centred. */}
			<div className="flex size-10 items-center justify-center">
				<InstallButton iconOnly />
			</div>
		</aside>
	);
}
