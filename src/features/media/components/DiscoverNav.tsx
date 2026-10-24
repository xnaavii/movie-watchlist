import { Link } from "@tanstack/react-router";
import { Clapperboard, Sparkles, Tv } from "lucide-react";
import { PillNav, PillNavItem } from "#/components/PillNav";
import type { MediaType } from "../types";

interface DiscoverNavProps {
	/** The page being shown; undefined for the mixed discover page. */
	current?: MediaType;
}

/** Switches between the mixed, movies and TV discover pages. */
export function DiscoverNav({ current }: DiscoverNavProps) {
	return (
		<PillNav aria-label="Discover">
			<PillNavItem asChild active={!current}>
				<Link to="/discover">
					<Sparkles aria-hidden="true" />
					Everything
				</Link>
			</PillNavItem>
			<PillNavItem asChild active={current === "movie"}>
				<Link to="/discover/movies">
					<Clapperboard aria-hidden="true" />
					Movies
				</Link>
			</PillNavItem>
			<PillNavItem asChild active={current === "tv"}>
				<Link to="/discover/tv-shows">
					<Tv aria-hidden="true" />
					TV shows
				</Link>
			</PillNavItem>
		</PillNav>
	);
}
