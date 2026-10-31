import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

function Sheet() {
	const [open, setOpen] = useState(true);
	return (
		<>
			<p>{open ? "open" : "closed"}</p>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogTitle>Add Watchlist to your Home Screen</DialogTitle>
					<input aria-label="field" />
				</DialogContent>
			</Dialog>
		</>
	);
}

/** jsdom's TouchEvent drops plain touch objects, so set them directly. */
function touch(el: Element, type: string, points: { x: number; y: number }[]) {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.defineProperty(event, "touches", {
		value: points.map((p) => ({ clientX: p.x, clientY: p.y })),
	});
	fireEvent(el, event);
}

function swipe(el: Element, dy: number, dx = 0) {
	touch(el, "touchstart", [{ x: 100, y: 100 }]);
	touch(el, "touchmove", [{ x: 100 + dx / 2, y: 100 + dy / 2 }]);
	touch(el, "touchmove", [{ x: 100 + dx, y: 100 + dy }]);
	touch(el, "touchend", []);
}

describe("DialogContent swipe to dismiss", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockReturnValue({
				matches: true,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}),
		);
	});
	afterEach(() => vi.unstubAllGlobals());

	const sheet = () => screen.getByRole("dialog");

	it("closes when swiped down on a phone", () => {
		render(<Sheet />);
		swipe(sheet(), 200);
		expect(screen.getByText("closed")).toBeInTheDocument();
	});

	it("stays open when swiped up or sideways", () => {
		render(<Sheet />);
		swipe(sheet(), -200);
		swipe(sheet(), 20, 200);
		expect(screen.getByText("open")).toBeInTheDocument();
	});

	it("lets the content scroll instead when it isn't at the top", () => {
		render(<Sheet />);
		sheet().scrollTop = 50;
		swipe(sheet(), 200);
		expect(screen.getByText("open")).toBeInTheDocument();
	});

	it("still closes from the grab handle when the content is scrolled", () => {
		render(<Sheet />);
		sheet().scrollTop = 50;
		// jsdom lays nothing out, so the sheet's top is 0 and y=20 is the handle.
		touch(sheet(), "touchstart", [{ x: 100, y: 20 }]);
		touch(sheet(), "touchmove", [{ x: 100, y: 120 }]);
		touch(sheet(), "touchmove", [{ x: 100, y: 220 }]);
		touch(sheet(), "touchend", []);
		expect(screen.getByText("closed")).toBeInTheDocument();
	});

	it("ignores swipes that start on a form field", () => {
		render(<Sheet />);
		swipe(screen.getByLabelText("field"), 200);
		expect(screen.getByText("open")).toBeInTheDocument();
	});

	it("does nothing where the dialog is centred, not a sheet", () => {
		vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
		render(<Sheet />);
		swipe(sheet(), 200);
		expect(screen.getByText("open")).toBeInTheDocument();
	});
});
