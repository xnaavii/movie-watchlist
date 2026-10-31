import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "#/config/site";
import { getTrendingMedia } from "#/features/media/server/media.functions";
import type { MediaType } from "#/features/media/types";
import { toMediaPath } from "#/features/media/utils/slug";
import {
	renderSitemap,
	type SitemapEntry,
	staticSitemapEntries,
} from "#/features/seo/sitemap";

/** This week's trending titles, so crawlers find fresh details pages. */
async function trendingEntries(mediaType: MediaType): Promise<SitemapEntry[]> {
	try {
		const page = await getTrendingMedia({
			data: { mediaType, time_window: "week" },
		});
		return page.results.map((media) => ({
			path: toMediaPath(media),
			changefreq: "weekly",
			priority: 0.7,
		}));
	} catch {
		// TMDB being down shouldn't take the rest of the sitemap with it.
		return [];
	}
}

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const [movies, shows] = await Promise.all([
					trendingEntries("movie"),
					trendingEntries("tv"),
				]);
				const xml = renderSitemap(getSiteUrl(), [
					...staticSitemapEntries(),
					...movies,
					...shows,
				]);
				return new Response(xml, {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
						"Cache-Control": "public, max-age=3600, s-maxage=86400",
					},
				});
			},
		},
	},
});
