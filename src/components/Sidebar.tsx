import { Link, useMatchRoute } from "@tanstack/react-router";
import { Compass, List, Search, VenetianMask } from "lucide-react";
import { UserMenu } from "#/features/auth/components/UserMenu";
import { cn } from "#/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";

type SidebarProps = {
	className?: string;
};

export function Sidebar({ className }: SidebarProps) {
	const matchRoute = useMatchRoute();

	return (
		<aside
			className={cn(
				"p-2 hidden md:flex flex-col justify-between items-center bg-sidebar",
				className,
			)}
		>
			<div className="size-12 flex items-center justify-center p-3">
				<VenetianMask className="text-sidebar-primary" />
			</div>
			<nav>
				<ul className="flex flex-col items-center gap-4">
					<Button
						size="icon-lg"
						asChild
						variant={matchRoute({ to: "/search" }) ? "default" : "secondary"}
					>
						<Link to="/search">
							<Search />
						</Link>
					</Button>
					<Button
						size="icon-lg"
						asChild
						variant={matchRoute({ to: "/explore" }) ? "default" : "secondary"}
					>
						<Link to="/explore">
							<Compass />
						</Link>
					</Button>
					<Button
						size="icon-lg"
						asChild
						variant={matchRoute({ to: "/watchlist" }) ? "default" : "secondary"}
					>
						<Link to="/watchlist">
							<List />
						</Link>
					</Button>
				</ul>
			</nav>
			<div className="flex flex-col gap-4 items-center">
				<UserMenu />
				<ModeToggle />
			</div>
		</aside>
	);
}
