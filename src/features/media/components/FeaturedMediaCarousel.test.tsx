import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaItem } from "../types";

/** A stand-in for Embla with three slides, the first one selected. */
const embla = vi.hoisted(() => {
	const listeners = new Map<string, Set<() => void>>();
	const state = { selected: 0 };
	const api = {
		canScrollPrev: () => true,
		canScrollNext: () => true,
		on: vi.fn((event: string, fn: () => void) => {
			if (!listeners.has(event)) listeners.set(event, new Set());
			listeners.get(event)?.add(fn);
		}),
		off: vi.fn((event: string, fn: () => void) => {
			listeners.get(event)?.delete(fn);
		}),
		emit: (event: string) => {
			for (const fn of listeners.get(event) ?? []) fn();
		},
		scrollPrev: vi.fn(),
		scrollNext: vi.fn(),
		scrollTo: vi.fn(),
		selectedScrollSnap: () => state.selected,
		scrollProgress: () => state.selected / 2,
		scrollSnapList: () => [0, 0.5, 1],
		internalEngine: () => ({
			options: { loop: false },
			slideRegistry: [[0], [1], [2]],
			slideLooper: { loopPoints: [] },
		}),
		slideNodes: () =>
			Array.from(
				document.querySelectorAll<HTMLElement>("[data-slot=carousel-item]"),
			),
		slidesInView: () => [0, 1, 2],
	};
	return { api, state, listeners };
});

vi.mock("embla-carousel-react", () => ({
	default: () => [() => {}, embla.api],
}));

vi.mock("embla-carousel-autoplay", () => ({
	default: () => ({ play: vi.fn(), stop: vi.fn(), reset: vi.fn() }),
}));

vi.mock("./MediaLink", () => ({
	MediaLink: ({
		media,
		...props
	}: {
		media: MediaItem;
		children?: ReactNode;
		className?: string;
	}) => <a href={`/${media.mediaType}/${media.id}`} {...props} />,
}));

vi.mock("#/features/watchlist/components/AddToWatchlistButton", () => ({
	AddToWatchlistButton: () => <button type="button">Add to watchlist</button>,
}));

import { FeaturedMediaCarousel } from "./FeaturedMediaCarousel";

const items: MediaItem[] = [
	{ id: 1, mediaType: "movie", title: "Dune", backdropPath: "/dune.jpg" },
	{ id: 2, mediaType: "tv", title: "Severance", backdropPath: "/sev.jpg" },
	{ id: 3, mediaType: "movie", title: "Heat", posterPath: "/heat.jpg" },
];

beforeEach(() => {
	embla.state.selected = 0;
	embla.listeners.clear();
	embla.api.scrollTo.mockClear();
	embla.api.scrollNext.mockClear();
	embla.api.scrollPrev.mockClear();
});

describe("FeaturedMediaCarousel", () => {
	it("renders nothing without items", () => {
		const { container } = render(<FeaturedMediaCarousel items={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("shows a dot for every movie and show, marking the current one", () => {
		render(<FeaturedMediaCarousel items={items} />);
		const dots = screen.getAllByRole("button", { name: /^Show / });
		expect(dots).toHaveLength(3);
		expect(dots[0]).toHaveAttribute("aria-current", "true");
		expect(dots[1]).not.toHaveAttribute("aria-current");
	});

	it("moves to a slide when its dot is pressed", async () => {
		render(<FeaturedMediaCarousel items={items} />);
		await userEvent.click(screen.getByRole("button", { name: "Show Heat" }));
		expect(embla.api.scrollTo).toHaveBeenCalledWith(2, false);
	});

	it("only lets you reach the middle slide; the neighbours sit behind it", () => {
		render(<FeaturedMediaCarousel items={items} />);
		const slides = screen.getAllByRole("group", { name: /of 3/ });
		const cards = slides.map((slide) => slide.firstElementChild);
		expect(cards[0]).not.toHaveAttribute("inert");
		expect(cards[1]).toHaveAttribute("inert");
		expect(cards[2]).toHaveAttribute("inert");
	});

	it("layers the middle slide above smaller neighbours", () => {
		render(<FeaturedMediaCarousel items={items} />);
		const [first, second, third] = screen.getAllByRole("group", {
			name: /of 3/,
		});
		expect(Number(first?.style.zIndex)).toBeGreaterThan(
			Number(second?.style.zIndex),
		);
		expect(Number(second?.style.zIndex)).toBeGreaterThan(
			Number(third?.style.zIndex),
		);
		const card = second?.firstElementChild as HTMLElement;
		expect(card.style.transform).toContain("scale(0.84)");
	});

	it("brings a neighbour to the middle when tapped", async () => {
		render(<FeaturedMediaCarousel items={items} />);
		const [, second] = screen.getAllByRole("group", { name: /of 3/ });
		if (!second) throw new Error("No second slide");
		await userEvent.click(second);
		expect(embla.api.scrollTo).toHaveBeenCalledWith(1, false);
	});

	it("keeps keyboard focus in the middle slide as it changes", async () => {
		render(<FeaturedMediaCarousel items={items} />);
		screen.getByRole("link", { name: "View Dune" }).focus();
		await userEvent.keyboard("{ArrowRight}");
		expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);

		embla.state.selected = 1;
		act(() => embla.api.emit("select"));
		expect(screen.getByRole("link", { name: "View Severance" })).toHaveFocus();
		expect(
			screen.getByRole("button", { name: "Show Severance" }),
		).toHaveAttribute("aria-current", "true");
	});
});
