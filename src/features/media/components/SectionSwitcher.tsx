import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import type { DiscoverSection } from "#/features/media/sections";
import { cn } from "#/lib/utils";

export interface SectionSwitcherProps {
	sections: DiscoverSection[];
	active: DiscoverSection["slug"];
	genreSlug: string;
}

/** Jumps between sibling sections without going back to the discover page. */
export function SectionSwitcher({
	sections,
	active,
	genreSlug,
}: SectionSwitcherProps) {
	return (
		<nav aria-label="More sections" className="-mx-4 overflow-x-auto px-4">
			<ul className="flex w-max gap-2">
				{sections.map((section) => {
					const isActive = section.slug === active;
					return (
						<li key={section.slug}>
							<Button
								asChild
								size="sm"
								variant={isActive ? "default" : "secondary"}
								className={cn(isActive && "pointer-events-none")}
							>
								<Link
									to="/discover/$genreSlug/$section"
									params={{ genreSlug, section: section.slug }}
									aria-current={isActive ? "page" : undefined}
									replace
								>
									{section.title}
								</Link>
							</Button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
