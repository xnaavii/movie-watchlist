import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaLogo } from "./MediaLogo";

const LOGO = "https://image.tmdb.org/t/p/original/logo.png";

function renderLogo(props: Partial<Parameters<typeof MediaLogo>[0]> = {}) {
	return render(
		<MediaLogo
			logoSrc={LOGO}
			title="Dune"
			fallbackClassName="text-3xl"
			{...props}
		/>,
	);
}

describe("MediaLogo", () => {
	it("shows the title as text until the logo loads", () => {
		renderLogo();
		expect(screen.getByText("Dune")).toBeInTheDocument();
		const logo = screen.getByAltText("Dune");
		expect(logo).toHaveClass("opacity-0");

		fireEvent.load(logo);

		expect(screen.queryByText("Dune")).not.toBeInTheDocument();
		expect(logo).not.toHaveClass("opacity-0");
	});

	it("keeps the title text when the logo fails", () => {
		renderLogo();
		fireEvent.error(screen.getByAltText("Dune"));

		expect(screen.getByText("Dune")).toBeInTheDocument();
		expect(screen.queryByAltText("Dune")).not.toBeInTheDocument();
	});

	it("goes back to the title text when the logo changes", () => {
		const { rerender } = renderLogo();
		fireEvent.load(screen.getByAltText("Dune"));

		rerender(
			<MediaLogo
				logoSrc={`${LOGO}?v=2`}
				title="Dune"
				fallbackClassName="text-3xl"
			/>,
		);

		expect(screen.getByText("Dune")).toBeInTheDocument();
	});

	it("shows no text without a fallback style", () => {
		renderLogo({ fallbackClassName: undefined });
		expect(screen.queryByText("Dune")).not.toBeInTheDocument();
	});
});
