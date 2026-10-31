import { render, screen } from "@testing-library/react";
import { BookmarkPlus } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Button, ButtonLabel } from "./button";

describe("Button with a responsive label", () => {
	it("keeps the label as the accessible name while hiding it below md", () => {
		render(
			<Button size="responsive-lg">
				<ButtonLabel>Add to watchlist</ButtonLabel>
				<BookmarkPlus data-icon="inline-end" />
			</Button>,
		);

		const button = screen.getByRole("button", { name: "Add to watchlist" });
		expect(button).toHaveAttribute("data-size", "responsive-lg");
		// Square icon button on phones, auto width with padding from md.
		expect(button.className).toMatch(/\bsize-10\b/);
		expect(button.className).toMatch(/\bmd:w-auto\b/);

		const label = screen.getByText("Add to watchlist");
		expect(label.className).toMatch(/\bsr-only\b/);
		expect(label.className).toMatch(/\bmd:not-sr-only\b/);
	});
});
