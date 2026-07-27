import { Link, useMatchRoute } from "@tanstack/react-router";
import {
	Compass,
	ListVideo,
	type LucideIcon,
	Search,
	User,
	VenetianMask,
} from "lucide-react";
import { Button } from "./ui/button";

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
		<Button size="icon" asChild variant={isActive ? "default" : "link"}>
			<Link
				to={to}
				activeProps={{ className: "text-sidebar-primary-foreground" }}
				inactiveProps={{ className: "text-sidebar-primary" }}
			>
				<Icon className="size-4" />
			</Link>
		</Button>
	);
}

export function Navbar() {
	const matchRoute = useMatchRoute();

	return (
		<header className="p-2 fixed top-0 flex gap-2 items-center md:hidden w-full bg-linear-to-b from-background to-transparent z-30">
			<nav className="flex justify-between w-full">
				<Button
					size="icon-lg"
					asChild
					variant={matchRoute({ to: "/" }) ? "link" : "ghost"}
				>
					<Link to="/">
						<VenetianMask className="size-4 text-sidebar-primary" />
					</Link>
				</Button>

				<ul className="flex items-center gap-4">
					{navItems.map((item) => (
						<NavIconButton key={item.to} {...item} />
					))}
				</ul>
			</nav>
		</header>
	);
}
