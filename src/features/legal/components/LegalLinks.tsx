import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import { LEGAL_PAGES } from "../config";

interface LegalLinksProps {
	className?: string;
}

/** The privacy, terms and cookies links, as a small row of text links. */
export function LegalLinks({ className }: LegalLinksProps) {
	return (
		<nav aria-label="Legal" className={cn("text-xs", className)}>
			<ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
				{LEGAL_PAGES.map((page) => (
					<li key={page.to}>
						<Link
							to={page.to}
							className="rounded-sm text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
						>
							{page.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
