import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OfflineBanner } from "./OfflineBanner";
import { clearCachedUserData, registerServiceWorker } from "./serviceWorker";

vi.stubGlobal("__BUILD_ID__", "build123");

function setOnline(online: boolean) {
	vi.spyOn(navigator, "onLine", "get").mockReturnValue(online);
	act(() => {
		window.dispatchEvent(new Event(online ? "online" : "offline"));
	});
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllEnvs();
});

describe("OfflineBanner", () => {
	it("shows only while offline", () => {
		render(<OfflineBanner />);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();

		setOnline(false);
		expect(screen.getByRole("status")).toHaveTextContent(/you're offline/i);

		setOnline(true);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});
});

describe("registerServiceWorker", () => {
	const register = vi.fn();
	const postMessage = vi.fn();

	beforeEach(() => {
		register.mockReset().mockResolvedValue({});
		postMessage.mockReset();
		Object.defineProperty(navigator, "serviceWorker", {
			configurable: true,
			value: { register, controller: { postMessage } },
		});
		vi.stubEnv("DEV", false);
	});

	afterEach(() => {
		// biome-ignore lint/suspicious/noExplicitAny: removing the test stub
		delete (navigator as any).serviceWorker;
	});

	it("registers a worker URL that changes with each build", () => {
		vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
		registerServiceWorker();
		expect(register).toHaveBeenCalledWith("/sw.js?build=build123");
	});

	it("waits for the page to finish loading first", () => {
		vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
		registerServiceWorker();
		expect(register).not.toHaveBeenCalled();

		window.dispatchEvent(new Event("load"));
		expect(register).toHaveBeenCalledTimes(1);
	});

	it("does nothing in development", () => {
		vi.stubEnv("DEV", true);
		vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
		registerServiceWorker();
		expect(register).not.toHaveBeenCalled();
	});

	it("survives a failed registration", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		register.mockRejectedValue(new Error("blocked"));
		vi.spyOn(document, "readyState", "get").mockReturnValue("complete");

		registerServiceWorker();
		await vi.waitFor(() => expect(warn).toHaveBeenCalled());
	});

	it("asks the worker to drop one account's data", () => {
		clearCachedUserData();
		expect(postMessage).toHaveBeenCalledWith({ type: "clear-user-data" });
	});
});

describe("clearCachedUserData without a worker", () => {
	it("is a no-op", () => {
		expect(() => clearCachedUserData()).not.toThrow();
	});
});
