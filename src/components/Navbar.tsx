import { Link, useMatchRoute } from "@tanstack/react-router";
import {
	Compass,
	ListVideo,
	type LucideIcon,
	Search,
	User,
} from "lucide-react";
import { BrandMark } from "./BrandMark";
import { Button } from "./ui/button";

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

export function Navbar() {
	const matchRoute = useMatchRoute();

	return (
		<header className="p-2 fixed top-0 flex gap-2 items-center md:hidden w-full bg-linear-to-b from-background to-transparent z-30">
			<nav aria-label="Main" className="flex justify-between w-full">
				<Button
					size="icon-lg"
					asChild
					variant={matchRoute({ to: "/" }) ? "link" : "ghost"}
				>
					<Link to="/" aria-label="Home">
						<BrandMark />
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
