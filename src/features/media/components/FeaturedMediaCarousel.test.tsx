import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaItem } from "../types";

/** A stand-in for Embla with three slides, the first one selected. */
const embla = vi.hoisted(() => {
	const listeners = new Map<string, Set<() => void>>();
	const state = { selected: 0, canScrollNext: true };
	const api = {
		canScrollPrev: () => true,
		canScrollNext: () => state.canScrollNext,
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

afterEach(() => {
	vi.unstubAllGlobals();
});

/**
 * Ends the fill's animation. jsdom has no AnimationEvent, so React listens
 * for the prefixed name there.
 */
function finishFill(fill: HTMLElement) {
	fireEvent(fill, new Event("webkitAnimationEnd", { bubbles: true }));
}

/** The fill inside the current dot, which counts down to the next slide. */
function progress() {
	const fill = document.querySelector<HTMLElement>(
		"[data-slot=slide-progress]",
	);
	if (!fill) throw new Error("No progress fill");
	return fill;
}

beforeEach(() => {
	embla.state.selected = 0;
	embla.state.canScrollNext = true;
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

	it("shows at most five titles", () => {
		const many = Array.from(
			{ length: 8 },
			(_, i): MediaItem => ({
				id: i + 1,
				mediaType: "movie",
				title: `Movie ${i + 1}`,
			}),
		);
		render(<FeaturedMediaCarousel items={many} />);
		expect(screen.getAllByRole("button", { name: /^Show / })).toHaveLength(5);
		expect(screen.getAllByRole("group", { name: /of 5/ })).toHaveLength(5);
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

	describe("autoplay progress", () => {
		it("fills the current dot and moves on once it is full", () => {
			render(<FeaturedMediaCarousel items={items} />);
			const dot = screen.getByRole("button", { name: "Show Dune" });
			expect(dot).toContainElement(progress());
			expect(progress()).toHaveAttribute("data-state", "playing");
			expect(progress().style.animationDuration).toBe("8000ms");

			finishFill(progress());
			expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
		});

		it("goes back to the first slide after the last one", () => {
			embla.state.canScrollNext = false;
			render(<FeaturedMediaCarousel items={items} />);
			finishFill(progress());
			expect(embla.api.scrollTo).toHaveBeenCalledWith(0);
		});

		it("starts the fill from empty when the slide changes", () => {
			render(<FeaturedMediaCarousel items={items} />);
			const first = progress();
			embla.state.selected = 2;
			act(() => embla.api.emit("select"));
			expect(progress()).not.toBe(first);
			expect(
				screen.getByRole("button", { name: "Show Heat" }),
			).toContainElement(progress());
		});

		it("pauses while the mouse is over the middle slide, not on a tap", () => {
			render(<FeaturedMediaCarousel items={items} />);
			const [middle] = screen.getAllByRole("group", { name: /of 3/ });
			if (!middle) throw new Error("No middle slide");
			fireEvent.pointerMove(middle, { pointerType: "touch" });
			expect(progress()).toHaveAttribute("data-state", "playing");

			fireEvent.pointerMove(middle, { pointerType: "mouse" });
			expect(progress()).toHaveAttribute("data-state", "paused");
			expect(progress().style.animationPlayState).toBe("paused");

			fireEvent.pointerLeave(middle, { pointerType: "mouse" });
			expect(progress()).toHaveAttribute("data-state", "playing");
		});

		it("keeps playing while the mouse is over a neighbour or the dots", () => {
			render(<FeaturedMediaCarousel items={items} />);
			const [, neighbour] = screen.getAllByRole("group", { name: /of 3/ });
			if (!neighbour) throw new Error("No neighbour slide");
			fireEvent.pointerMove(neighbour, { pointerType: "mouse" });
			expect(progress()).toHaveAttribute("data-state", "playing");

			fireEvent.pointerMove(screen.getByRole("button", { name: "Show Heat" }), {
				pointerType: "mouse",
			});
			expect(progress()).toHaveAttribute("data-state", "playing");
		});

		it("lets the next middle slide play until the mouse moves on it", () => {
			render(<FeaturedMediaCarousel items={items} />);
			const [middle] = screen.getAllByRole("group", { name: /of 3/ });
			if (!middle) throw new Error("No middle slide");
			fireEvent.pointerMove(middle, { pointerType: "mouse" });
			expect(progress()).toHaveAttribute("data-state", "paused");

			embla.state.selected = 1;
			act(() => embla.api.emit("select"));
			expect(progress()).toHaveAttribute("data-state", "playing");
		});

		it("pauses while keyboard focus is inside the hero", async () => {
			render(
				<>
					<FeaturedMediaCarousel items={items} />
					<button type="button">After</button>
				</>,
			);
			// jsdom doesn't track :focus-visible; Tab would set it in a browser.
			const matches = Element.prototype.matches;
			vi.spyOn(Element.prototype, "matches").mockImplementation(function (
				this: Element,
				selector: string,
			) {
				return selector === ":focus-visible" || matches.call(this, selector);
			});
			await userEvent.tab();
			expect(progress()).toHaveAttribute("data-state", "paused");

			act(() => screen.getByRole("button", { name: "After" }).focus());
			expect(progress()).toHaveAttribute("data-state", "playing");
			vi.restoreAllMocks();
		});

		it("pauses while a slide is dragged", () => {
			render(<FeaturedMediaCarousel items={items} />);
			act(() => embla.api.emit("pointerDown"));
			expect(progress()).toHaveAttribute("data-state", "paused");
			act(() => embla.api.emit("pointerUp"));
			expect(progress()).toHaveAttribute("data-state", "playing");
		});

		it("pauses while the tab is hidden", () => {
			render(<FeaturedMediaCarousel items={items} />);
			const visibility = vi
				.spyOn(document, "visibilityState", "get")
				.mockReturnValue("hidden");
			act(() => {
				document.dispatchEvent(new Event("visibilitychange"));
			});
			expect(progress()).toHaveAttribute("data-state", "paused");
			visibility.mockRestore();
		});

		it("stays still and full when reduced motion is on", () => {
			vi.stubGlobal(
				"matchMedia",
				vi.fn().mockReturnValue({
					matches: true,
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				}),
			);
			render(<FeaturedMediaCarousel items={items} />);
			expect(progress()).toHaveAttribute("data-state", "static");
			expect(progress().style.animationDuration).toBe("");
		});
	});
});
