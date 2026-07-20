import { Link, useMatchRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Compass, ListVideo, Search, User, VenetianMask } from "lucide-react";
import { cn } from "#/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";

type SidebarProps = {
	className?: string;
};

type NavItem = {
	to: string;
	icon: LucideIcon;
};

const navItems: NavItem[] = [
	{ to: "/search", icon: Search },
	{ to: "/discover", icon: Compass },
	{ to: "/watchlist", icon: ListVideo },
	{ to: "/profile", icon: User },
];

function NavIconButton({ to, icon: Icon }: NavItem) {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ to });

	return (
		<Button size="icon-lg" asChild variant={isActive ? "default" : "link"}>
			<Link
				to={to}
				activeProps={{ className: "text-sidebar-primary-foreground" }}
				inactiveProps={{ className: "text-sidebar-primary" }}
			>
				<Icon className="size-5" />
			</Link>
		</Button>
	);
}

export function Sidebar({ className }: SidebarProps) {
	return (
		<aside
			className={cn(
				"p-6 ml-2 my-2 hidden md:flex flex-col justify-between items-center bg-sidebar/60 drop-shadow-2xl rounded-2xl",
				className,
			)}
		>
			<Button size="icon-lg" asChild variant="ghost">
				<Link to="/">
					<VenetianMask className="size-5 text-sidebar-primary" />
				</Link>
			</Button>
			<nav>
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
