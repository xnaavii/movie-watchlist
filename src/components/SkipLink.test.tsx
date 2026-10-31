import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
	it("is the first tab stop and moves focus to the content", async () => {
		const user = userEvent.setup();
		render(
			<>
				<SkipLink targetId="content" />
				<nav>
					<a href="/discover">Discover</a>
				</nav>
				<main id="content" tabIndex={-1}>
					<a href="/movies/1">A movie</a>
				</main>
			</>,
		);

		await user.tab();
		expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();

		await user.keyboard("{Enter}");
		expect(screen.getByRole("main")).toHaveFocus();

		await user.tab();
		expect(screen.getByRole("link", { name: "A movie" })).toHaveFocus();
	});
});
