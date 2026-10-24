import { describe, expect, it } from "vitest";
import {
	DEFAULT_PICK_OPTIONS,
	pickOptionsFromSearch,
	pickOptionsToSearch,
	pickSearchSchema,
	toPickRequest,
} from "./PickOptionsBar";

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

describe("pick options in the URL", () => {
	it("leaves defaults out of the URL", () => {
		expect(pickOptionsToSearch(DEFAULT_PICK_OPTIONS)).toEqual({
			mood: undefined,
			time: undefined,
			company: undefined,
			watchlist: undefined,
			attempt: undefined,
		});
	});

	it("round-trips options so a return visit rebuilds the same request", () => {
		const options = {
			mood: "Cozy",
			time: "medium",
			company: "Date night",
			useWatchlist: true,
		} as const;
		expect(pickOptionsFromSearch(pickOptionsToSearch(options))).toEqual(
			options,
		);
		expect(
			pickOptionsFromSearch(pickOptionsToSearch(DEFAULT_PICK_OPTIONS)),
		).toEqual(DEFAULT_PICK_OPTIONS);
	});

	it("drops values it does not know", () => {
		expect(
			pickSearchSchema.parse({ mood: "Sleepy", time: "long", attempt: -1 }),
		).toEqual({
			mood: undefined,
			time: undefined,
			company: undefined,
			watchlist: undefined,
			attempt: undefined,
		});
	});
});
