import { describe, expect, it } from "vitest";
import { DEFAULT_PICK_OPTIONS, toPickRequest } from "./PickOptionsBar";

describe("toPickRequest", () => {
	it("trims the prompt and leaves moods empty without a mood", () => {
		expect(toPickRequest("  cozy mystery  ", DEFAULT_PICK_OPTIONS)).toEqual({
			prompt: "cozy mystery",
			moods: [],
			time: "any",
			company: undefined,
			useWatchlist: false,
		});
	});

	it("turns the single mood option into the moods list", () => {
		const request = toPickRequest("", {
			...DEFAULT_PICK_OPTIONS,
			mood: "Tense",
			time: "short",
			company: "Friends",
			useWatchlist: true,
		});
		expect(request).toEqual({
			prompt: "",
			moods: ["Tense"],
			time: "short",
			company: "Friends",
			useWatchlist: true,
		});
	});
});
