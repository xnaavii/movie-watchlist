import { describe, expect, it } from "vitest";

function getNextPaginatedPage(lastPage: { page: number; total_pages: number }) {
	return lastPage.page >= lastPage.total_pages ? undefined : lastPage.page + 1;
}

describe("getNextPaginatedPage", () => {
	it("returns the next page when more pages exist", () => {
		expect(getNextPaginatedPage({ page: 1, total_pages: 5 })).toBe(2);
	});

	it("returns undefined on the last page", () => {
		expect(getNextPaginatedPage({ page: 5, total_pages: 5 })).toBeUndefined();
	});

	it("returns undefined if page exceeds total_pages", () => {
		expect(getNextPaginatedPage({ page: 6, total_pages: 5 })).toBeUndefined();
	});
});
