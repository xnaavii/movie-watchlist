import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "#/__tests__/RenderWithRouter";
import { MediaTrailer, trailerEmbedUrl } from "./MediaTrailer";

describe("MediaTrailer", () => {
	it("doesn't contact YouTube until the viewer presses play", async () => {
		const user = userEvent.setup();
		const { container } = await renderWithRouter(
			<MediaTrailer trailerId="abc123" title="Dune" />,
		);
		expect(container.querySelector("iframe")).toBeNull();

		await user.click(
			screen.getByRole("button", { name: "Play trailer for Dune" }),
		);

		const frame = screen.getByTitle("Dune Trailer");
		expect(frame.getAttribute("src")).toMatch(
			/^https:\/\/www\.youtube-nocookie\.com\/embed\/abc123\?/,
		);
		expect(frame.getAttribute("src")).toContain("autoplay=1");
	});

	it("plays from the keyboard", async () => {
		const user = userEvent.setup();
		await renderWithRouter(<MediaTrailer trailerId="abc123" title="Dune" />);
		await user.tab();
		expect(
			screen.getByRole("button", { name: "Play trailer for Dune" }),
		).toHaveFocus();
		await user.keyboard("{Enter}");
		expect(screen.getByTitle("Dune Trailer")).toBeInTheDocument();
	});

	it("builds privacy-enhanced embed URLs", () => {
		expect(trailerEmbedUrl("a b", { autoPlay: false, mute: true })).toBe(
			"https://www.youtube-nocookie.com/embed/a%20b?autoplay=0&mute=1&rel=0",
		);
	});
});
