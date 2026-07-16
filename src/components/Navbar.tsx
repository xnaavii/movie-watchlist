import { Link, useMatchRoute } from "@tanstack/react-router";
import { Compass, ListVideo, Search, User, VenetianMask } from "lucide-react";
import { Button } from "./ui/button";

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
						<VenetianMask className="size-5 text-sidebar-primary" />
					</Link>
				</Button>
				<ul className="flex items-center gap-2">
					<li>
						<Button
							size="icon-lg"
							asChild
							variant={matchRoute({ to: "/search" }) ? "link" : "ghost"}
						>
							<Link
								to="/search"
								activeProps={{ className: "text-sidebar-primary" }}
							>
								<Search className="size-5" />
							</Link>
						</Button>
					</li>
					<li>
						<Button
							size="icon-lg"
							asChild
							variant={matchRoute({ to: "/discover" }) ? "link" : "ghost"}
						>
							<Link
								to="/discover"
								activeProps={{ className: "text-sidebar-primary" }}
							>
								<Compass className="size-5" />
							</Link>
						</Button>
					</li>
					<li>
						<Button
							size="icon-lg"
							asChild
							variant={matchRoute({ to: "/profile" }) ? "link" : "ghost"}
						>
							<Link
								to="/profile"
								activeProps={{ className: "text-sidebar-primary" }}
							>
								<User className="size-5" />
							</Link>
						</Button>
					</li>
					<li>
						<Button
							size="icon-lg"
							asChild
							variant={matchRoute({ to: "/watchlist" }) ? "link" : "ghost"}
						>
							<Link
								to="/watchlist"
								activeProps={{ className: "text-sidebar-primary" }}
							>
								<ListVideo className="size-5" />
							</Link>
						</Button>
					</li>
				</ul>
			</nav>
		</header>
	);
}
