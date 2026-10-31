import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "#/__tests__/RenderWithRouter";
import { LegalLinks } from "./components/LegalLinks";
import { SiteFooter } from "./components/SiteFooter";
import { formatLastUpdated, LEGAL_PAGES } from "./config";
import { STORAGE_ITEMS } from "./storageItems";

describe("legal links", () => {
	it("links to the privacy policy, terms and cookies pages", async () => {
		await renderWithRouter(<LegalLinks />);
		const nav = screen.getByRole("navigation", { name: "Legal" });
		expect(
			within(nav)
				.getAllByRole("link")
				.map((link) => link.getAttribute("href")),
		).toEqual(["/privacy", "/terms", "/cookies"]);
	});

	it("credits TMDB in the site footer, as its terms require", async () => {
		await renderWithRouter(<SiteFooter />);
		expect(screen.getByRole("link", { name: "TMDB" })).toHaveAttribute(
			"href",
			"https://www.themoviedb.org",
		);
		// Hidden in the installed app, which keeps the links on Profile instead.
		expect(screen.getByRole("contentinfo")).toHaveClass("standalone:hidden");
	});

	it("formats the last updated date the same in every time zone", () => {
		expect(formatLastUpdated("2026-10-31")).toBe("October 31, 2026");
		expect(LEGAL_PAGES).toHaveLength(3);
	});
});

describe("cookie and storage disclosure", () => {
	const read = (path: string) =>
		readFileSync(resolve(__dirname, "../..", path), "utf8");

	it("lists the guest watchlist under the key the app really uses", () => {
		const key = read("features/watchlist/guest/guestWatchlist.ts").match(
			/STORAGE_KEY = "([^"]+)"/,
		)?.[1];
		expect(key).toBeTruthy();
		expect(STORAGE_ITEMS.map((item) => item.name)).toContain(key);
	});

	it("lists the session cookie cache with the lifetime auth uses", () => {
		const maxAge = Number(
			read("lib/auth.ts").match(
				/cookieCache:[^}]*maxAge:\s*(\d+)\s*\*\s*60/,
			)?.[1],
		);
		const cache = STORAGE_ITEMS.find(
			(item) => item.name === "better-auth.session_data",
		);
		expect(cache?.lasts).toBe(`${maxAge} minutes`);
	});

	it("doesn't load web fonts from Google, which would share visitors' IPs", () => {
		expect(read("styles.css")).not.toMatch(/fonts\.googleapis\.com/);
	});
});
