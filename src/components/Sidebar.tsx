import { Link, useMatchRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Compass, ListVideo, Search, User } from "lucide-react";
import { cn } from "#/lib/utils";
import { BrandMark } from "./BrandMark";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";

type SidebarProps = {
	className?: string;
};

type NavItem = {
	to: string;
	label: string;
	icon: LucideIcon;
};

const navItems: NavItem[] = [
	{ to: "/search", label: "Search", icon: Search },
	{ to: "/discover", label: "Discover", icon: Compass },
	{ to: "/watchlist", label: "Watchlist", icon: ListVideo },
	{ to: "/profile", label: "Profile", icon: User },
];

function NavIconButton({ to, label, icon: Icon }: NavItem) {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ to });

	return (
		<li>
			<Button size="icon-lg" asChild variant={isActive ? "default" : "ghost"}>
				<Link
					to={to}
					preload="intent"
					aria-label={label}
					title={label}
					aria-current={isActive ? "page" : undefined}
				>
					<Icon className="size-5" aria-hidden="true" />
				</Link>
			</Button>
		</li>
	);
}

export function Sidebar({ className }: SidebarProps) {
	return (
		<aside
			className={cn(
				"p-4 hidden md:flex flex-col justify-between items-center bg-sidebar/30 backdrop-blur-3xl",
				className,
			)}
		>
			<Button size="icon-lg" asChild variant="ghost">
				<Link to="/" aria-label="Home">
					<BrandMark className="size-5" />
				</Link>
			</Button>
			<nav aria-label="Main">
				<ul className="flex flex-col items-center gap-4">
					{navItems.map((item) => (
						<NavIconButton key={item.to} {...item} />
					))}
				</ul>
			</nav>
			<div className="flex flex-col gap-4 items-center">
				<ModeToggle />
			</div>
		</aside>
	);
}
