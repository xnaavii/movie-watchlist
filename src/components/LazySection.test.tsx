import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LazySection } from "./LazySection";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let observers: Callback[] = [];
const original = global.IntersectionObserver;

beforeEach(() => {
	observers = [];
	global.IntersectionObserver = class {
		constructor(callback: Callback) {
			observers.push(callback);
		}
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof IntersectionObserver;
});

afterEach(() => {
	global.IntersectionObserver = original;
});

const setVisible = (isIntersecting: boolean) =>
	act(() => {
		observers.at(-1)?.([{ isIntersecting }]);
	});

describe("LazySection", () => {
	it("shows the fallback until the section scrolls near the view", () => {
		render(
			<LazySection fallback={<p>Loading</p>}>
				<p>Content</p>
			</LazySection>,
		);
		expect(screen.getByText("Loading")).toBeInTheDocument();
		expect(screen.queryByText("Content")).not.toBeInTheDocument();

		setVisible(true);
		expect(screen.getByText("Content")).toBeInTheDocument();
	});

	it("keeps the content after it scrolls away again", () => {
		render(
			<LazySection fallback={<p>Loading</p>}>
				<p>Content</p>
			</LazySection>,
		);
		setVisible(true);
		setVisible(false);
		expect(screen.getByText("Content")).toBeInTheDocument();
	});

	it("renders right away when eager", () => {
		render(
			<LazySection eager fallback={<p>Loading</p>}>
				<p>Content</p>
			</LazySection>,
		);
		expect(screen.getByText("Content")).toBeInTheDocument();
		expect(observers).toHaveLength(0);
	});
});
