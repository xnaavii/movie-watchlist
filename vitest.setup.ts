import "@testing-library/jest-dom/vitest";

window.scrollTo = () => {};

global.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

global.IntersectionObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof IntersectionObserver;