import { describe, expect, it } from "vitest";
import type { DiscReleases } from "../types";
import { pickBestWayToWatch } from "./bestWayToWatch";
import type { WhereToWatch } from "./watchProviders";

const netflix = {
	provider_id: 8,
	provider_name: "Netflix",
	logo_path: "/n.png",
	display_priority: 1,
	kind: "stream" as const,
};
const where: WhereToWatch = { region: "IE", link: "ie", options: [netflix] };
const discs = (...formats: DiscReleases["formats"]): DiscReleases => ({
	releases: [{ region: "IE", date: "2024-01-01", formats }],
	formats,
});

describe("pickBestWayToWatch", () => {
	it("picks the first watch option and a 4K disc", () => {
		expect(pickBestWayToWatch(where, discs("uhd", "bluray"))).toEqual({
			easiest: netflix,
			bestQuality: "uhd",
		});
	});

	it("doesn't call a Blu-ray best when it can be streamed", () => {
		expect(pickBestWayToWatch(where, discs("bluray"))).toEqual({
			easiest: netflix,
			bestQuality: null,
		});
	});

	it("falls back to any known disc when there's no digital option", () => {
		expect(pickBestWayToWatch(null, discs("dvd"))).toEqual({
			easiest: null,
			bestQuality: "dvd",
		});
	});

	it("returns null when there's nothing to recommend", () => {
		expect(pickBestWayToWatch(null, null)).toBeNull();
		expect(pickBestWayToWatch(null, discs())).toBeNull();
	});
});
