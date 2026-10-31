import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useInView } from "./useInView";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let observers: {
	callback: Callback;
	options?: IntersectionObserverInit;
	disconnected: boolean;
}[] = [];
const original = global.IntersectionObserver;

beforeEach(() => {
	observers = [];
	global.IntersectionObserver = class {
		record;
		constructor(callback: Callback, options?: IntersectionObserverInit) {
			this.record = { callback, options, disconnected: false };
			observers.push(this.record);
		}
		observe() {}
		unobserve() {}
		disconnect() {
			this.record.disconnected = true;
		}
	} as unknown as typeof IntersectionObserver;
});

afterEach(() => {
	global.IntersectionObserver = original;
});

function Probe({ rootMargin }: { rootMargin?: string }) {
	const { ref, inView } = useInView({ rootMargin });
	return <div ref={ref}>{inView ? "in view" : "waiting"}</div>;
}

describe("useInView", () => {
	it("watches against the scrolling <main>, not the window", () => {
		render(
			<main style={{ overflowY: "auto" }} data-testid="main">
				<Probe />
			</main>,
		);
		expect(observers[0]?.options?.root).toBe(screen.getByTestId("main"));
		expect(observers[0]?.options?.rootMargin).toBe("600px");
	});

	it("uses the window when nothing scrolls", () => {
		render(<Probe rootMargin="100px" />);
		expect(observers[0]?.options).toMatchObject({
			root: null,
			rootMargin: "100px",
		});
	});

	it("stays in view once reached and stops observing", () => {
		render(<Probe />);
		expect(screen.getByText("waiting")).toBeInTheDocument();

		act(() => observers[0]?.callback([{ isIntersecting: false }]));
		expect(screen.getByText("waiting")).toBeInTheDocument();

		act(() => observers[0]?.callback([{ isIntersecting: true }]));
		expect(screen.getByText("in view")).toBeInTheDocument();
		expect(observers[0]?.disconnected).toBe(true);
		expect(observers).toHaveLength(1);
	});

	it("counts as in view in browsers without IntersectionObserver", () => {
		// biome-ignore lint/suspicious/noExplicitAny: removing the API for this test
		delete (global as any).IntersectionObserver;
		render(<Probe />);
		expect(screen.getByText("in view")).toBeInTheDocument();
	});
});
