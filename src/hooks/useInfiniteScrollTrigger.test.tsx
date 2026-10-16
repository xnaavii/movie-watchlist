import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInfiniteScrollTrigger } from "./useInfiniteScrollTrigger";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let observers: { callback: Callback; options?: IntersectionObserverInit }[] =
	[];
const original = global.IntersectionObserver;

beforeEach(() => {
	observers = [];
	global.IntersectionObserver = class {
		constructor(callback: Callback, options?: IntersectionObserverInit) {
			observers.push({ callback, options });
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
		observers.at(-1)?.callback([{ isIntersecting }]);
	});

function List(props: {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	disabled?: boolean;
	itemCount?: number;
}) {
	const ref = useInfiniteScrollTrigger({ itemCount: 0, ...props });
	return (
		<main style={{ overflowY: "auto" }} data-testid="scroller">
			<div ref={ref} />
		</main>
	);
}

describe("useInfiniteScrollTrigger", () => {
	it("observes against the nearest scroll container", () => {
		const { getByTestId } = render(
			<List hasNextPage isFetchingNextPage={false} fetchNextPage={vi.fn()} />,
		);
		expect(observers.at(-1)?.options?.root).toBe(getByTestId("scroller"));
	});

	it("loads the next page when the sentinel comes into view", () => {
		const fetchNextPage = vi.fn();
		render(
			<List
				hasNextPage
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
			/>,
		);
		expect(fetchNextPage).not.toHaveBeenCalled();
		setVisible(true);
		expect(fetchNextPage).toHaveBeenCalledTimes(1);
	});

	it("keeps loading after a page lands while the sentinel is still in view", () => {
		const fetchNextPage = vi.fn();
		const { rerender } = render(
			<List
				hasNextPage
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
			/>,
		);
		setVisible(true);
		rerender(
			<List hasNextPage isFetchingNextPage fetchNextPage={fetchNextPage} />,
		);
		rerender(
			<List
				hasNextPage
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
			/>,
		);
		expect(fetchNextPage).toHaveBeenCalledTimes(2);
	});

	it("retries a trigger that arrived while a page was loading", () => {
		const fetchNextPage = vi.fn();
		const { rerender } = render(
			<List hasNextPage isFetchingNextPage fetchNextPage={fetchNextPage} />,
		);
		setVisible(true);
		expect(fetchNextPage).not.toHaveBeenCalled();
		rerender(
			<List
				hasNextPage
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
			/>,
		);
		expect(fetchNextPage).toHaveBeenCalledTimes(1);
	});

	it("re-checks when a new list replaces the old one while in view", () => {
		const fetchNextPage = vi.fn();
		const { rerender } = render(
			<List
				hasNextPage
				isFetchingNextPage
				fetchNextPage={fetchNextPage}
				itemCount={20}
			/>,
		);
		setVisible(true);
		rerender(
			<List
				hasNextPage
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
				itemCount={20}
				disabled
			/>,
		);
		rerender(
			<List
				hasNextPage
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
				itemCount={3}
			/>,
		);
		expect(fetchNextPage).toHaveBeenCalledTimes(1);
	});

	it("stops when there are no more pages, when out of view, or when disabled", () => {
		const fetchNextPage = vi.fn();
		const { rerender } = render(
			<List
				hasNextPage={false}
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
			/>,
		);
		setVisible(true);
		rerender(
			<List
				hasNextPage
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
				disabled
			/>,
		);
		setVisible(false);
		rerender(
			<List
				hasNextPage
				isFetchingNextPage={false}
				fetchNextPage={fetchNextPage}
			/>,
		);
		expect(fetchNextPage).not.toHaveBeenCalled();
	});
});
