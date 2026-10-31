/**
 * Who runs Watchlist and how people reach them about their data. The privacy
 * policy and terms read these, so update them here.
 *
 * These pages are a starting template written from what the code does, not
 * legal advice. Review them (ideally with a lawyer) before relying on them,
 * and update them whenever the app starts collecting something new.
 */
export const LEGAL_CONFIG = {
	/** The person or company responsible for the data (the "controller"). */
	operator: "Ivan Petrović",
	/** Where privacy requests and questions go. */
	contactEmail: "xnaaviitech@gmail.com",
	/** Shown at the top of every legal page. Bump it when the text changes. */
	lastUpdated: "2026-10-31",
} as const;

export const LEGAL_PAGES = [
	{ to: "/privacy", label: "Privacy" },
	{ to: "/terms", label: "Terms" },
	{ to: "/cookies", label: "Cookies" },
] as const;

export type LegalPath = (typeof LEGAL_PAGES)[number]["to"];

const lastUpdatedFormat = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "UTC",
});

export function formatLastUpdated(date: string = LEGAL_CONFIG.lastUpdated) {
	return lastUpdatedFormat.format(new Date(`${date}T00:00:00Z`));
}
