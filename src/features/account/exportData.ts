/**
 * Builds the "Download my data" file: everything Watchlist stores about an
 * account, minus secrets (password hashes, OAuth tokens and session tokens),
 * which aren't the person's data and would be dangerous in a download.
 */

type Timestamp = Date | string | null;

export type ExportSource = {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
		createdAt: Timestamp;
		updatedAt: Timestamp;
	};
	accounts: {
		providerId: string;
		createdAt: Timestamp;
		scope: string | null;
	}[];
	sessions: {
		createdAt: Timestamp;
		updatedAt: Timestamp;
		expiresAt: Timestamp;
		ipAddress: string | null;
		userAgent: string | null;
	}[];
	watchlist: {
		tmdbId: number;
		mediaType: "movie" | "tv";
		title: string | null;
		status: "want_to_watch" | "watched";
		addedAt: Timestamp;
		watchedAt: Timestamp;
	}[];
	atmosVotes: {
		tmdbId: number;
		mediaType: "movie" | "tv";
		hasAtmos: boolean;
		updatedAt: Timestamp;
	}[];
	soundRatings: {
		tmdbId: number;
		mediaType: "movie" | "tv";
		overall: number;
		immersion: number | null;
		bass: number | null;
		dialogue: number | null;
		setup: string | null;
		createdAt: Timestamp;
		updatedAt: Timestamp;
	}[];
};

const iso = (value: Timestamp) =>
	value === null ? null : new Date(value).toISOString();

const SIGN_IN_METHODS: Record<string, string> = {
	credential: "Email and password",
	google: "Google",
};

export function buildAccountExport(
	source: ExportSource,
	exportedAt = new Date(),
) {
	const { user } = source;
	return {
		exportedAt: exportedAt.toISOString(),
		about:
			"Everything Watchlist stores about your account. Passwords, sign-in tokens and session tokens are left out for your safety.",
		profile: {
			id: user.id,
			name: user.name,
			email: user.email,
			emailVerified: user.emailVerified,
			image: user.image,
			createdAt: iso(user.createdAt),
			updatedAt: iso(user.updatedAt),
		},
		signInMethods: source.accounts.map((account) => ({
			method: SIGN_IN_METHODS[account.providerId] ?? account.providerId,
			scope: account.scope,
			linkedAt: iso(account.createdAt),
		})),
		sessions: source.sessions.map((session) => ({
			startedAt: iso(session.createdAt),
			lastRefreshedAt: iso(session.updatedAt),
			expiresAt: iso(session.expiresAt),
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
		})),
		watchlist: source.watchlist.map((entry) => ({
			title: entry.title,
			mediaType: entry.mediaType,
			tmdbId: entry.tmdbId,
			tmdbUrl: `https://www.themoviedb.org/${entry.mediaType}/${entry.tmdbId}`,
			status: entry.status === "watched" ? "Watched" : "Want to watch",
			addedAt: iso(entry.addedAt),
			watchedAt: iso(entry.watchedAt),
		})),
		atmosVotes: source.atmosVotes.map((vote) => ({
			mediaType: vote.mediaType,
			tmdbId: vote.tmdbId,
			hasAtmos: vote.hasAtmos,
			votedAt: iso(vote.updatedAt),
		})),
		soundRatings: source.soundRatings.map((rating) => ({
			mediaType: rating.mediaType,
			tmdbId: rating.tmdbId,
			overall: rating.overall,
			immersion: rating.immersion,
			bass: rating.bass,
			dialogue: rating.dialogue,
			setup: rating.setup,
			ratedAt: iso(rating.createdAt),
			updatedAt: iso(rating.updatedAt),
		})),
	};
}

export type AccountExport = ReturnType<typeof buildAccountExport>;

export function exportFileName(date = new Date()) {
	return `watchlist-data-${date.toISOString().slice(0, 10)}.json`;
}
