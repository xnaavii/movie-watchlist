import { afterEach, describe, expect, it, vi } from "vitest";
import { forUserOrGuest, resetClientUser, setClientUser } from "./clientAuth";

afterEach(() => {
	resetClientUser();
	vi.useRealTimers();
});

describe("forUserOrGuest", () => {
	it("reads the device list when signed out", async () => {
		setClientUser(null);
		const server = vi.fn(async () => "server");
		expect(await forUserOrGuest(server, () => "guest")).toBe("guest");
		expect(server).not.toHaveBeenCalled();
	});

	it("asks the server when signed in", async () => {
		setClientUser({ id: "u1" });
		expect(
			await forUserOrGuest(
				async () => "server",
				() => "guest",
			),
		).toBe("server");
	});

	it("waits for the first session check", async () => {
		const result = forUserOrGuest(
			async () => "server",
			() => "guest",
		);
		setClientUser(null);
		expect(await result).toBe("guest");
	});

	it("falls back to the server if the session check never finishes", async () => {
		vi.useFakeTimers();
		const result = forUserOrGuest(
			async () => "server",
			() => "guest",
		);
		await vi.advanceTimersByTimeAsync(5000);
		expect(await result).toBe("server");
	});
});

describe("offline", () => {
	it("uses the device list when offline and the session is unknown", async () => {
		const onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
		expect(
			await forUserOrGuest(
				async () => "server",
				() => "guest",
			),
		).toBe("guest");
		onLine.mockRestore();
	});
});
