import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PillNav, PillNavItem } from "#/components/PillNav";
import { DISCOVER_TYPE_PAGES } from "../discoverPages";
import { MEDIA_TYPE_CONFIG } from "../mediaTypes";
import { MEDIA_TYPES, type MediaType } from "../types";

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
			{MEDIA_TYPES.map((mediaType) => {
				const { pluralLabel, icon: Icon } = MEDIA_TYPE_CONFIG[mediaType];
				return (
					<PillNavItem key={mediaType} asChild active={current === mediaType}>
						<Link to={DISCOVER_TYPE_PAGES[mediaType].path}>
							<Icon aria-hidden="true" />
							{pluralLabel}
						</Link>
					</PillNavItem>
				);
			})}
		</PillNav>
	);
}
