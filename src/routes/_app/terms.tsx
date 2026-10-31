import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_CONFIG } from "#/config/site";
import { LegalPage } from "#/features/legal/components/LegalPage";
import { LEGAL_CONFIG } from "#/features/legal/config";
import { seo } from "#/utils/seo";

export const Route = createFileRoute("/_app/terms")({
	component: TermsPage,
	head: () => ({
		meta: seo({
			title: `Terms of use · ${SITE_CONFIG.name}`,
			description: `The rules for using ${SITE_CONFIG.name}.`,
		}),
	}),
});

function TermsPage() {
	const { operator, contactEmail } = LEGAL_CONFIG;

	return (
		<LegalPage
			title="Terms of use"
			summary={
				<p>
					Watchlist is a free, personal project for finding things to watch and
					keeping track of them. Use it fairly, keep your account safe, and
					remember the movie information comes from other services.
				</p>
			}
		>
			<h2>The service</h2>
			<p>
				{SITE_CONFIG.name} is provided by {operator} free of charge, as is. By
				using it you agree to these terms. If you don't agree, please don't use
				it.
			</p>
			<p>
				We may change, pause or stop any part of Watchlist at any time. If we
				shut it down, we'll give account holders reasonable notice so they can
				download their data.
			</p>

			<h2>Your account</h2>
			<ul>
				<li>You need to be at least 16 to create an account.</li>
				<li>
					Give a real email address, keep your password to yourself, and tell us
					if you think someone else is using your account.
				</li>
				<li>
					You can delete your account at any time from your{" "}
					<Link to="/profile">profile</Link>.
				</li>
			</ul>

			<h2>Fair use</h2>
			<p>Please don't:</p>
			<ul>
				<li>
					scrape, overload or try to break the service, or get around its rate
					limits;
				</li>
				<li>
					try to access other people's accounts or data, or the systems behind
					Watchlist;
				</li>
				<li>
					use AI picks or ratings to post anything unlawful, or to manipulate
					the community votes.
				</li>
			</ul>
			<p>
				We may suspend or remove accounts that break these rules, and will tell
				you why when we can.
			</p>

			<h2>Content and attribution</h2>
			<p>
				Movie and TV information, posters and images come from{" "}
				<a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
					The Movie Database (TMDB)
				</a>
				. This product uses the TMDB API but is not endorsed or certified by
				TMDB. Ratings come from OMDb, streaming availability from Watchmode and
				JustWatch, and trailers from YouTube. All titles, images and trademarks
				belong to their owners.
			</p>
			<p>
				AI picks are suggestions written by a language model. They can be wrong
				or describe a title inaccurately, so check details before you rely on
				them. Streaming availability can be out of date.
			</p>
			<p>
				Your watchlist and ratings stay yours. You let us store and show them to
				you, and include your votes and ratings in anonymous totals other people
				see.
			</p>

			<h2>Liability</h2>
			<p>
				Watchlist is free and provided without warranties. As far as the law
				allows, we aren't liable for indirect losses or for data lost through
				the service. Nothing in these terms limits rights you have as a consumer
				that can't be limited by law.
			</p>

			<h2>Changes and contact</h2>
			<p>
				We'll update these terms as the app changes, and the date at the top
				shows the latest version. Using Watchlist after a change means you
				accept it. Questions go to{" "}
				<a href={`mailto:${contactEmail}`}>{contactEmail}</a>. How we handle
				your data is in the <Link to="/privacy">privacy policy</Link>.
			</p>
		</LegalPage>
	);
}
