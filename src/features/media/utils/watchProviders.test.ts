import { describe, expect, it } from "vitest";
import { pickWhereToWatch } from "./watchProviders";

const provider = (id: number, name: string, priority = id) => ({
	provider_id: id,
	provider_name: name,
	logo_path: `/${name}.png`,
	display_priority: priority,
});

describe("pickWhereToWatch", () => {
	it("returns null when no region has providers", () => {
		expect(pickWhereToWatch({})).toBeNull();
		expect(pickWhereToWatch({ IE: { link: "x" } })).toBeNull();
	});

	it("falls back to the next region", () => {
		const result = pickWhereToWatch({
			US: { link: "us", flatrate: [provider(8, "Netflix")] },
		});
		expect(result?.region).toBe("US");
		expect(result?.link).toBe("us");
	});

	it("puts streaming first and keeps each provider once", () => {
		const result = pickWhereToWatch({
			IE: {
				link: "ie",
				buy: [provider(2, "Apple"), provider(10, "Amazon")],
				rent: [provider(2, "Apple")],
				flatrate: [provider(9, "Prime", 2), provider(8, "Netflix", 1)],
			},
		});
		expect(result?.options.map((o) => [o.provider_name, o.kind])).toEqual([
			["Netflix", "stream"],
			["Prime", "stream"],
			["Apple", "rent"],
			["Amazon", "buy"],
		]);
	});
});
