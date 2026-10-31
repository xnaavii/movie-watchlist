import {
	Compass,
	ListVideo,
	type LucideIcon,
	Search,
	User,
} from "lucide-react";

export type NavItem = {
	to: "/discover" | "/search" | "/watchlist" | "/profile";
	label: string;
	icon: LucideIcon;
};

/** The app's top-level destinations, shared by the tab bar and the rail. */
export const navItems: NavItem[] = [
	{ to: "/discover", label: "Discover", icon: Compass },
	{ to: "/search", label: "Search", icon: Search },
	{ to: "/watchlist", label: "Watchlist", icon: ListVideo },
	{ to: "/profile", label: "Profile", icon: User },
];
