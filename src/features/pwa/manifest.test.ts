import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = resolve(__dirname, "../../../public");
const manifest = JSON.parse(
	readFileSync(resolve(publicDir, "manifest.json"), "utf8"),
) as {
	start_url: string;
	display: string;
	theme_color: string;
	background_color: string;
	icons: { src: string; sizes: string; purpose?: string }[];
};

describe("web app manifest", () => {
	it("opens the installed app on discover, without browser chrome", () => {
		expect(manifest.start_url).toBe("/discover");
		expect(manifest.display).toBe("standalone");
	});

	it("uses the dark background, since the app is dark only", () => {
		expect(manifest.theme_color).toBe("#0a0a0a");
		expect(manifest.background_color).toBe("#0a0a0a");
	});

	it("points only at icons that exist", () => {
		for (const icon of manifest.icons) {
			expect(existsSync(resolve(publicDir, `.${icon.src}`)), icon.src).toBe(
				true,
			);
		}
	});

	it("has the icons Android needs to install it", () => {
		const sizes = manifest.icons.map((icon) => icon.sizes);
		expect(sizes).toContain("192x192");
		expect(sizes).toContain("512x512");
		expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(
			true,
		);
	});

	it("has the offline page the service worker falls back to", () => {
		expect(existsSync(resolve(publicDir, "offline.html"))).toBe(true);
	});
});
