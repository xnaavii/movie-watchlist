import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

// The discover sections fetch through server functions that need the DB.
vi.mock("#/features/media/server/media.functions", () => ({}));

import { absoluteUrl, PRODUCTION_URL, SITE_CONFIG } from "#/config/site";
import { DISCOVER_GENRES } from "#/features/media/genres";
import { HOME_TITLE, pageHead, pageTitle, siteJsonLd } from "#/utils/seo";
import { renderSitemap, staticSitemapEntries } from "./sitemap";

const publicDir = resolve(__dirname, "../../../public");

type Head = ReturnType<typeof pageHead>;
const content = (head: Head, key: string) =>
	head.meta.find(
		(tag) =>
			("property" in tag && tag.property === key) ||
			("name" in tag && tag.name === key),
	)?.content;

describe("pageHead", () => {
	it("gives every page the branded preview image, sized, with alt text", () => {
		const head = pageHead({ title: pageTitle("Terms of use"), path: "/terms" });
		expect(head.meta[0]).toEqual({ title: "Terms of use | Watchlist" });
		expect(content(head, "og:image")).toBe(absoluteUrl("/og-image.jpg"));
		expect(content(head, "og:image:width")).toBe("1200");
		expect(content(head, "og:image:height")).toBe("630");
		expect(content(head, "og:image:alt")).toBe(SITE_CONFIG.ogImage.alt);
		expect(content(head, "twitter:card")).toBe("summary_large_image");
		expect(content(head, "og:site_name")).toBe("Watchlist");
	});

	it("points the canonical link and og:url at the page", () => {
		const head = pageHead({ title: "Horror", path: "/discover/horror" });
		const url = absoluteUrl("/discover/horror");
		expect(head.links).toEqual([{ rel: "canonical", href: url }]);
		expect(content(head, "og:url")).toBe(url);
	});

	it("falls back to the app's pitch as the description", () => {
		const head = pageHead({ title: HOME_TITLE });
		expect(content(head, "description")).toBe(SITE_CONFIG.description);
		expect(SITE_CONFIG.description).toMatch(/find something to watch/i);
		expect(SITE_CONFIG.description).toMatch(/movies and tv/i);
	});

	it("marks private pages noindex and gives them no canonical link", () => {
		const head = pageHead({
			title: pageTitle("Your watchlist"),
			path: "/watchlist",
			noindex: true,
		});
		expect(content(head, "robots")).toBe("noindex, follow");
		expect(head.links).toEqual([]);
		expect(content(head, "og:url")).toBeUndefined();
	});

	it("renders structured data that can't end its script tag", () => {
		const head = pageHead({
			title: HOME_TITLE,
			jsonLd: { "@context": "https://schema.org", name: "</script>" },
		});
		expect(head.scripts[0].type).toBe("application/ld+json");
		expect(head.scripts[0].children).not.toContain("</script>");
	});
});

describe("siteJsonLd", () => {
	it("describes the site with its search and the free web app", () => {
		const data = siteJsonLd();
		const [site, app] = data["@graph"];
		expect(site).toMatchObject({ "@type": "WebSite", name: "Watchlist" });
		expect(site.potentialAction?.target.urlTemplate).toBe(
			`${absoluteUrl("/search")}?q={search_term_string}`,
		);
		expect(app).toMatchObject({
			"@type": "WebApplication",
			offers: { price: "0" },
		});
	});
});

describe("sitemap", () => {
	const paths = staticSitemapEntries().map((entry) => entry.path);

	it("lists discover, every genre, the legal pages and no private pages", () => {
		expect(paths).toEqual(
			expect.arrayContaining([
				"/discover",
				"/discover/movies",
				"/discover/tv-shows",
				"/discover/all/trending",
				"/privacy",
				"/terms",
				"/cookies",
				...DISCOVER_GENRES.map((genre) => `/discover/${genre.slug}`),
			]),
		);
		for (const path of ["/search", "/watchlist", "/profile", "/auth/login"]) {
			expect(paths).not.toContain(path);
		}
	});

	it("renders valid, escaped, de-duplicated XML", () => {
		const xml = renderSitemap("https://watchlist.xnaavii.com", [
			{ path: "/discover", changefreq: "daily", priority: 1 },
			{ path: "/discover", changefreq: "daily", priority: 1 },
			{ path: "/movies/1-a&b", changefreq: "weekly", priority: 0.7 },
		]);
		expect(xml).toMatch(/^<\?xml version="1.0"/);
		expect(xml.match(/<url>/g)).toHaveLength(2);
		expect(xml).toContain(
			"<loc>https://watchlist.xnaavii.com/movies/1-a&amp;b</loc>",
		);
		expect(xml).toContain("<priority>1.0</priority>");
	});
});

describe("robots.txt", () => {
	const robots = readFileSync(resolve(publicDir, "robots.txt"), "utf8");

	it("points crawlers at the sitemap on the live domain", () => {
		expect(robots).toContain(`Sitemap: ${PRODUCTION_URL}/sitemap.xml`);
	});

	it("doesn't block the noindexed pages, so crawlers can see the noindex", () => {
		expect(robots).not.toMatch(/Disallow: \/(search|watchlist|profile)/);
	});
});

describe("link preview image", () => {
	it("exists in public/", () => {
		expect(existsSync(resolve(publicDir, `.${SITE_CONFIG.ogImage.path}`))).toBe(
			true,
		);
	});
});
