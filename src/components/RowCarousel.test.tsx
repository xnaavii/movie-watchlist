import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CarouselItem } from "#/components/ui/carousel";

/** A stand-in for Embla: which slides are on screen, and what was asked of it. */
const embla = vi.hoisted(() => ({
	inView: [0, 1],
	canScrollPrev: false,
	canScrollNext: true,
	api: {
		canScrollPrev: () => embla.canScrollPrev,
		canScrollNext: () => embla.canScrollNext,
		on: vi.fn(),
		off: vi.fn(),
		scrollPrev: vi.fn(),
		scrollNext: vi.fn(),
		scrollTo: vi.fn(),
		slideNodes: () =>
			Array.from(
				document.querySelectorAll<HTMLElement>("[data-slot=carousel-item]"),
			),
		slidesInView: () => embla.inView,
	},
}));

vi.mock("embla-carousel-react", () => ({
	default: () => [() => {}, embla.api],
}));

import { RowCarousel } from "./RowCarousel";

function renderRow() {
	return render(
		<RowCarousel
			header={<h2>Trending</h2>}
			actions={<a href="/discover/trending">See all</a>}
		>
			{["Alien", "Arrival", "Dune", "Heat"].map((title) => (
				<CarouselItem key={title} className="basis-auto pl-4">
					<a href={`/movies/${title}`}>{title}</a>
				</CarouselItem>
			))}
		</RowCarousel>,
	);
}

beforeEach(() => {
	embla.inView = [0, 1];
	embla.canScrollPrev = false;
	embla.canScrollNext = true;
	for (const fn of [
		embla.api.scrollPrev,
		embla.api.scrollNext,
		embla.api.scrollTo,
	]) {
		fn.mockClear();
	}
});

describe("RowCarousel", () => {
	it("puts the title, actions and arrows in the header", () => {
		renderRow();
		const row = screen.getByRole("region");
		expect(row).toHaveAttribute("aria-roledescription", "carousel");
		expect(
			screen.getByRole("heading", { name: "Trending" }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "See all" })).toBeInTheDocument();
		expect(screen.getAllByRole("group")).toHaveLength(4);
	});

	it("disables the arrow for the side there's nothing more on", () => {
		renderRow();
		expect(
			screen.getByRole("button", { name: "Previous slide" }),
		).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next slide" })).toBeEnabled();
	});

	it("scrolls with the arrow buttons", async () => {
		embla.canScrollPrev = true;
		renderRow();
		await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
		await userEvent.click(
			screen.getByRole("button", { name: "Previous slide" }),
		);
		expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
		expect(embla.api.scrollPrev).toHaveBeenCalledTimes(1);
	});

	it("scrolls with the arrow keys from inside the row", async () => {
		renderRow();
		screen.getByRole("link", { name: "Alien" }).focus();
		await userEvent.keyboard("{ArrowRight}");
		expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
		await userEvent.keyboard("{ArrowLeft}");
		expect(embla.api.scrollPrev).toHaveBeenCalledTimes(1);
	});

	it("brings an off-screen title into view when tabbed to", async () => {
		renderRow();
		screen.getByRole("link", { name: "Arrival" }).focus();
		expect(embla.api.scrollTo).not.toHaveBeenCalled();

		await userEvent.tab();
		expect(screen.getByRole("link", { name: "Dune" })).toHaveFocus();
		expect(embla.api.scrollTo).toHaveBeenCalledWith(2);
	});

	it("undoes the browser's own scroll so slides aren't clipped", () => {
		renderRow();
		const viewport = document.querySelector<HTMLElement>(
			"[data-slot=carousel-content]",
		);
		if (!viewport) throw new Error("No carousel viewport");
		viewport.scrollLeft = 240;
		fireEvent.scroll(viewport);
		expect(viewport.scrollLeft).toBe(0);
	});
});
