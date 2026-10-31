import { SITE_CONFIG } from "#/config/site";
import { LegalLinks } from "./LegalLinks";

/**
 * The footer at the end of every page in the browser. The installed app
 * hides it (the standalone variant) and keeps the links on Profile and the
 * sign-in pages instead, like a native app's settings.
 */
export function SiteFooter() {
	return (
		<footer className="site-footer flex standalone:hidden flex-col gap-3 border-t px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6 lg:px-8">
			<p>
				© {new Date().getFullYear()} {SITE_CONFIG.name}. Movie and TV data from{" "}
				<a
					href="https://www.themoviedb.org"
					target="_blank"
					rel="noreferrer"
					className="underline underline-offset-4 hover:text-foreground"
				>
					TMDB
				</a>
				.
			</p>
			<LegalLinks />
		</footer>
	);
}
