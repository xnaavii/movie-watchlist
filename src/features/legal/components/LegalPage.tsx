import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Container } from "#/components/Container";
import { PillNav, PillNavItem } from "#/components/PillNav";
import { formatLastUpdated, LEGAL_PAGES } from "../config";

interface LegalPageProps {
	title: string;
	/** One or two sentences under the title, in plain words. */
	summary: ReactNode;
	children: ReactNode;
}

/** Shared layout for the privacy policy, terms and cookie pages. */
export function LegalPage({ title, summary, children }: LegalPageProps) {
	const pathname = useLocation({ select: (location) => location.pathname });

	return (
		<Container className="gap-8 md:gap-10 lg:gap-12">
			<header className="flex max-w-3xl flex-col gap-5">
				<PillNav aria-label="Legal pages">
					{LEGAL_PAGES.map((page) => (
						<PillNavItem key={page.to} active={pathname === page.to} asChild>
							<Link to={page.to}>{page.label}</Link>
						</PillNavItem>
					))}
				</PillNav>
				<div className="flex flex-col gap-3">
					<h1 className="text-3xl font-semibold tracking-tighter md:text-4xl">
						{title}
					</h1>
					<p className="text-sm text-muted-foreground">
						Last updated {formatLastUpdated()}
					</p>
				</div>
				<div className="border-l-2 border-primary pl-4 text-base text-foreground/90 md:text-lg">
					{summary}
				</div>
			</header>
			<article className="prose prose-invert max-w-3xl prose-headings:tracking-tight prose-h2:mt-10 [&>h2:first-child]:mt-0 prose-h2:text-xl prose-a:text-foreground prose-a:decoration-primary prose-a:decoration-2 prose-a:underline-offset-4 prose-li:my-1 prose-table:text-sm">
				{children}
			</article>
		</Container>
	);
}
