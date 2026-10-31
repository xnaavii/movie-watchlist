import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mockDisplayMode(standalone: boolean) {
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockImplementation((query: string) => ({
			matches: standalone && query.includes("standalone"),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		})),
	);
}

function mockUserAgent(userAgent: string) {
	vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
}

describe("app shell store", () => {
	beforeEach(() => vi.resetModules());
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("offers the Add to Home Screen steps in iPhone Safari", async () => {
		mockDisplayMode(false);
		mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)");
		const { useAppShell, startAppShell } = await import("./appShellStore");
		startAppShell();
		expect(useAppShell.getState()).toMatchObject({
			isStandalone: false,
			installSupport: "ios",
		});
	});

	it("offers the browser's prompt once it fires", async () => {
		mockDisplayMode(false);
		mockUserAgent("Mozilla/5.0 (Linux; Android 15) Chrome/140");
		const { useAppShell, startAppShell } = await import("./appShellStore");
		startAppShell();
		expect(useAppShell.getState().installSupport).toBeNull();

		const event = Object.assign(new Event("beforeinstallprompt"), {
			prompt: vi.fn().mockResolvedValue(undefined),
			userChoice: Promise.resolve({ outcome: "accepted" }),
		});
		window.dispatchEvent(event);
		expect(useAppShell.getState().installSupport).toBe("prompt");

		await useAppShell.getState().install();
		expect(event.prompt).toHaveBeenCalled();
		expect(useAppShell.getState().installSupport).toBeNull();
	});

	it("offers nothing once installed", async () => {
		mockDisplayMode(true);
		mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)");
		const { useAppShell, startAppShell } = await import("./appShellStore");
		startAppShell();
		expect(useAppShell.getState()).toMatchObject({
			isStandalone: true,
			installSupport: null,
		});
	});
});
