import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_CONFIG } from "#/config/site";
import { LegalPage } from "#/features/legal/components/LegalPage";
import { LEGAL_CONFIG } from "#/features/legal/config";
import { pageHead, pageTitle } from "#/utils/seo";

export const Route = createFileRoute("/_app/privacy")({
	component: PrivacyPage,
	head: () =>
		pageHead({
			title: pageTitle("Privacy policy"),
			description: `What ${SITE_CONFIG.name} collects, why, and how to download or delete your data.`,
			path: "/privacy",
		}),
});

function PrivacyPage() {
	const { operator, country, contactEmail } = LEGAL_CONFIG;
	const mailto = <a href={`mailto:${contactEmail}`}>{contactEmail}</a>;

	return (
		<LegalPage
			title="Privacy policy"
			summary={
				<p>
					Watchlist collects only what it needs to save your watchlist and keep
					your account secure. There are no ads, no analytics and no tracking
					across sites, and you can download or delete everything from your{" "}
					<Link to="/profile" className="underline underline-offset-4">
						profile
					</Link>
					.
				</p>
			}
		>
			<h2>Who is responsible</h2>
			<p>
				{SITE_CONFIG.name} is run by {operator}, based in {country}, who is the
				controller of your personal data under the EU General Data Protection
				Regulation (GDPR) and Ireland's Data Protection Act 2018. For any
				privacy question or request, email {mailto}.
			</p>

			<h2>If you use Watchlist without an account</h2>
			<ul>
				<li>
					<strong>Your watchlist stays on your device.</strong> Titles you save
					are kept in your browser's local storage and never sent to us until
					you create an account or sign in.
				</li>
				<li>
					<strong>Offline copies.</strong> The app saves pages, posters and data
					you have viewed in your browser so it works offline. They stay on your
					device.
				</li>
				<li>
					<strong>AI picks.</strong> When you ask for picks, the text you type
					is sent to our server and to Cloudflare Workers AI to choose titles.
					We don't store it. To share the free AI allowance fairly, your IP
					address is used as a short-lived rate-limit key.
				</li>
				<li>
					<strong>Server logs.</strong> Like any website, our host (Cloudflare)
					receives your IP address, browser details and the pages you request,
					and keeps short-lived logs to run and secure the service.
				</li>
			</ul>

			<h2>If you create an account</h2>
			<ul>
				<li>
					<strong>Account details:</strong> your name and email address. If you
					sign up with email, a securely hashed password (we can't read it).
				</li>
				<li>
					<strong>Google sign-in:</strong> if you choose it, Google shares your
					name, email address, profile picture and Google account ID with us,
					plus sign-in tokens. We don't get access to anything else in your
					Google account.
				</li>
				<li>
					<strong>Sessions:</strong> for each device you sign in on, when it
					started and expires, its IP address and browser (user agent), so you
					stay signed in and we can spot misuse.
				</li>
				<li>
					<strong>Your activity:</strong> the movies and shows on your
					watchlist, whether you've watched them and when, plus any Dolby Atmos
					votes and sound ratings you give. Other people only see votes and
					ratings as anonymous totals and averages, never linked to you.
				</li>
				<li>
					<strong>Emails:</strong> we send account emails only (verifying your
					address and resetting your password). No newsletters or marketing.
				</li>
			</ul>

			<h2>Why we use it, and our legal basis</h2>
			<ul>
				<li>
					<strong>To provide the service you asked for</strong> (GDPR Article
					6(1)(b), contract): your account, sign-in, watchlist, stats and
					ratings.
				</li>
				<li>
					<strong>To keep it secure and working</strong> (Article 6(1)(f),
					legitimate interests): sessions, logs, rate limits and preventing
					abuse.
				</li>
				<li>
					<strong>With your consent</strong> (Article 6(1)(a)): trailers only
					load from YouTube after you press play. You can choose not to.
				</li>
			</ul>
			<p>
				We never sell your data, use it for advertising or build profiles about
				you. Watchlist makes no automated decisions that affect you legally.
			</p>

			<h2>Services that process data for us</h2>
			<p>
				These providers handle data on our behalf, or receive it directly when
				your browser loads their content:
			</p>
			<div className="not-prose overflow-x-auto">
				<table className="w-full min-w-xl text-left text-sm">
					<thead className="text-muted-foreground">
						<tr className="border-b">
							<th className="py-2 pr-4 font-medium">Service</th>
							<th className="py-2 pr-4 font-medium">What for</th>
							<th className="py-2 font-medium">Data involved</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						<ProviderRow
							name="Cloudflare"
							href="https://www.cloudflare.com/privacypolicy/"
							purpose="Hosting, caching, logs, rate limits and Workers AI picks"
							data="IP address, request details, AI picks text"
						/>
						<ProviderRow
							name="Neon"
							href="https://neon.com/privacy-policy"
							purpose="The database for accounts and watchlists"
							data="Everything listed under 'If you create an account'"
						/>
						<ProviderRow
							name="Google"
							href="https://policies.google.com/privacy"
							purpose="Sign in with Google, and your profile picture"
							data="Your Google profile, IP address when the picture loads"
						/>
						<ProviderRow
							name="Resend"
							href="https://resend.com/legal/privacy-policy"
							purpose="Sending verification and password emails"
							data="Name, email address"
						/>
						<ProviderRow
							name="TMDB"
							href="https://www.themoviedb.org/privacy-policy"
							purpose="Posters and images, loaded by your browser"
							data="IP address and browser details"
						/>
						<ProviderRow
							name="YouTube (Google)"
							href="https://policies.google.com/privacy"
							purpose="Trailers, in privacy-enhanced mode, only after you press play"
							data="IP address, and YouTube may store data on your device"
						/>
					</tbody>
				</table>
			</div>
			<p>
				Movie details, ratings and streaming availability also come from TMDB,
				OMDb and Watchmode, but our server fetches those. No personal data is
				sent to them.
			</p>

			<h2>International transfers</h2>
			<p>
				Some of these providers are based in, or process data in, the United
				States. Where data leaves the European Economic Area, it is protected by
				the EU-US Data Privacy Framework or the European Commission's Standard
				Contractual Clauses.
			</p>

			<h2>How long we keep it</h2>
			<ul>
				<li>Your account and activity: until you delete your account.</li>
				<li>
					Sessions: until you sign out or they expire, at most 7 days after your
					last visit.
				</li>
				<li>Email verification and reset links: 24 hours or less.</li>
				<li>Host logs: a few days, under Cloudflare's retention.</li>
				<li>
					Data on your device: until you clear it, or after sign-in for the
					guest watchlist, which moves to your account.
				</li>
			</ul>
			<p>
				Deleting your account removes your account, sign-in methods, sessions,
				watchlist, votes and ratings straight away. Copies in our providers'
				backups expire on their normal schedule.
			</p>

			<h2>Your rights</h2>
			<p>Under the GDPR you can:</p>
			<ul>
				<li>
					<strong>Access and take your data:</strong> use{" "}
					<em>Download my data</em> on your <Link to="/profile">profile</Link>{" "}
					for a copy in JSON.
				</li>
				<li>
					<strong>Delete it:</strong> use <em>Delete account</em> on your
					profile.
				</li>
				<li>
					<strong>Correct it, restrict it or object to how it's used:</strong>{" "}
					email {mailto}.
				</li>
				<li>
					<strong>Withdraw consent</strong> at any time, for example by not
					playing trailers and clearing YouTube's data from your browser.
				</li>
				<li>
					<strong>Complain</strong> to the Irish{" "}
					<a
						href="https://www.dataprotection.ie"
						target="_blank"
						rel="noreferrer"
					>
						Data Protection Commission
					</a>
					, our lead supervisory authority, or to the authority where you live
					or work. We'd appreciate the chance to fix things first.
				</li>
			</ul>
			<p>We answer requests within one month.</p>

			<h2>Children</h2>
			<p>
				Watchlist isn't meant for children under 16, and we don't knowingly
				collect their data. If you believe a child has made an account, email{" "}
				{mailto} and we'll delete it.
			</p>

			<h2>Security</h2>
			<p>
				All traffic is encrypted with HTTPS, passwords are hashed, and sign-in
				cookies are HTTP-only and secure. No system is perfectly secure, and
				we'll tell you and the authorities if a breach puts your data at risk.
			</p>

			<h2>Changes</h2>
			<p>
				If this policy changes, we'll update the date at the top. For important
				changes, we'll let account holders know by email or in the app.
			</p>
			<p>
				See also the <Link to="/cookies">cookies and storage page</Link> and the{" "}
				<Link to="/terms">terms of use</Link>.
			</p>
		</LegalPage>
	);
}

function ProviderRow({
	name,
	href,
	purpose,
	data,
}: {
	name: string;
	href: string;
	purpose: string;
	data: string;
}) {
	return (
		<tr className="align-top">
			<td className="py-3 pr-4 font-medium">
				<a
					href={href}
					target="_blank"
					rel="noreferrer"
					className="underline underline-offset-4 hover:text-primary"
				>
					{name}
				</a>
			</td>
			<td className="py-3 pr-4 text-muted-foreground">{purpose}</td>
			<td className="py-3 text-muted-foreground">{data}</td>
		</tr>
	);
}
