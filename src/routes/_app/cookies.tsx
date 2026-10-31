import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_CONFIG } from "#/config/site";
import { LegalPage } from "#/features/legal/components/LegalPage";
import { STORAGE_ITEMS } from "#/features/legal/storageItems";
import { seo } from "#/utils/seo";

export const Route = createFileRoute("/_app/cookies")({
	component: CookiesPage,
	head: () => ({
		meta: seo({
			title: `Cookies and storage · ${SITE_CONFIG.name}`,
			description: `Every cookie and piece of browser storage ${SITE_CONFIG.name} uses, and why.`,
		}),
	}),
});

function CookiesPage() {
	return (
		<LegalPage
			title="Cookies and storage"
			summary={
				<p>
					Watchlist only stores what it needs to work: keeping you signed in,
					holding your watchlist and working offline. Nothing is used for
					analytics or ads, so there's no cookie banner to click through.
				</p>
			}
		>
			<h2>What Watchlist stores</h2>
			<p>
				On secure connections, the cookie names start with{" "}
				<code>__Secure-</code>. All cookies are first-party, HTTP-only where
				possible, and never shared with anyone.
			</p>
			<div className="not-prose overflow-x-auto">
				<table className="w-full min-w-xl text-left text-sm">
					<thead className="text-muted-foreground">
						<tr className="border-b">
							<th className="py-2 pr-4 font-medium">Name</th>
							<th className="py-2 pr-4 font-medium">Type</th>
							<th className="py-2 pr-4 font-medium">Why</th>
							<th className="py-2 font-medium">How long</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						{STORAGE_ITEMS.map((item) => (
							<tr key={item.name} className="align-top">
								<td className="py-3 pr-4 font-mono text-xs">{item.name}</td>
								<td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
									{item.kind}
								</td>
								<td className="py-3 pr-4 text-muted-foreground">
									{item.purpose}
								</td>
								<td className="py-3 text-muted-foreground">{item.lasts}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<h2>Why there's no consent banner</h2>
			<p>
				EU rules let a site store things on your device without asking when
				they're strictly necessary for a service you requested. Everything above
				is. If Watchlist ever adds analytics or other optional storage, it will
				ask you first.
			</p>

			<h2>Third-party content</h2>
			<ul>
				<li>
					<strong>Trailers</strong> come from YouTube in its privacy-enhanced
					mode, and only load after you press play. Once playing, YouTube
					(Google) may set its own cookies or storage, under{" "}
					<a
						href="https://policies.google.com/technologies/cookies"
						target="_blank"
						rel="noreferrer"
					>
						Google's cookie policy
					</a>
					.
				</li>
				<li>
					<strong>Posters and images</strong> load from TMDB's image servers.
					They don't set cookies, but TMDB sees your IP address, as with any
					image on the web.
				</li>
				<li>
					<strong>Profile pictures</strong> from Google sign-in load from
					Google's servers.
				</li>
			</ul>

			<h2>Removing it</h2>
			<p>
				Signing out deletes the sign-in cookies. To remove everything else,
				clear this site's data in your browser's settings, or uninstall the app
				if you installed it. Clearing it while signed out deletes your device
				watchlist for good, so sign in first if you want to keep it.
			</p>
			<p>
				More about how your data is used is in the{" "}
				<Link to="/privacy">privacy policy</Link>.
			</p>
		</LegalPage>
	);
}
