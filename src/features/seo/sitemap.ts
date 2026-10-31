import { DISCOVER_GENRES } from "#/features/media/genres";
import {
	ALL_GENRES_SLUG,
	listDiscoverSections,
} from "#/features/media/sections";

export type ChangeFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface SitemapEntry {
	path: string;
	changefreq: ChangeFrequency;
	priority: number;
}

/**
 * Every public page that doesn't depend on live data: the discover pages,
 * one page per genre, the "See more" pages and the legal pages. Search,
 * the watchlist, the profile and the auth pages are left out on purpose;
 * they're per-user and marked noindex.
 */
export function staticSitemapEntries(): SitemapEntry[] {
	return [
		{ path: "/discover", changefreq: "daily", priority: 1 },
		{ path: "/discover/movies", changefreq: "daily", priority: 0.9 },
		{ path: "/discover/tv-shows", changefreq: "daily", priority: 0.9 },
		{ path: "/discover/atmos", changefreq: "weekly", priority: 0.6 },
		...DISCOVER_GENRES.map((genre) => ({
			path: `/discover/${genre.slug}`,
			changefreq: "daily" as const,
			priority: 0.8,
		})),
		...listDiscoverSections().map((section) => ({
			path: `/discover/${ALL_GENRES_SLUG}/${section.slug}`,
			changefreq: "daily" as const,
			priority: 0.6,
		})),
		{ path: "/privacy", changefreq: "yearly", priority: 0.2 },
		{ path: "/terms", changefreq: "yearly", priority: 0.2 },
		{ path: "/cookies", changefreq: "yearly", priority: 0.2 },
	];
}

const escapeXml = (text: string) =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

/** Renders a sitemap.xml for the given absolute origin. Duplicate paths are dropped. */
export function renderSitemap(origin: string, entries: SitemapEntry[]): string {
	const seen = new Set<string>();
	const urls = entries
		.filter((entry) => !seen.has(entry.path) && seen.add(entry.path))
		.map(
			(entry) =>
				`<url><loc>${escapeXml(`${origin}${entry.path}`)}</loc><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority.toFixed(1)}</priority></url>`,
		);

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
