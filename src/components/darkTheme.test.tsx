import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, render, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it } from "vitest";
import { Toaster } from "#/components/ui/sonner";

/** The app is dark only: no light palette, no theme toggle. */
describe("dark only theme", () => {
	const css = readFileSync(resolve(__dirname, "../styles.css"), "utf8");

	it("tells the browser the page is dark, so form controls and scrollbars match", () => {
		expect(css).toMatch(/:root\s*{[^}]*color-scheme:\s*dark/);
	});

	it("defines a single palette with no light or system-preference variant", () => {
		expect(css.match(/--background:/g)).toHaveLength(1);
		expect(css).not.toMatch(/prefers-color-scheme/);
		expect(css).not.toMatch(/\.light\b/);
	});

	it("shows toasts in the dark theme", async () => {
		render(<Toaster />);
		await act(async () => {
			toast("Saved");
		});
		await waitFor(() =>
			expect(document.querySelector("[data-sonner-theme]")).toHaveAttribute(
				"data-sonner-theme",
				"dark",
			),
		);
	});
});
