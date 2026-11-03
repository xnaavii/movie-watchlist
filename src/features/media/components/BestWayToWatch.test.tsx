import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BestWayToWatchPicks } from "./BestWayToWatchPicks";
import { DiscReleasesList } from "./DiscReleasesList";

const netflix = {
	provider_id: 8,
	provider_name: "Netflix",
	logo_path: "/n.png",
	display_priority: 1,
	kind: "stream" as const,
};

describe("BestWayToWatchPicks", () => {
	it("shows the easiest option and a 4K disc", () => {
		render(
			<BestWayToWatchPicks
				picks={{ easiest: netflix, bestQuality: "uhd" }}
				watchLink="https://justwatch"
				discLink="https://discs"
			/>,
		);
		expect(
			screen.getByRole("link", { name: /Included with Netflix/ }),
		).toHaveAttribute("href", "https://justwatch");
		expect(
			screen.getByRole("link", { name: /4K UHD Blu-ray/ }),
		).toHaveAttribute("href", "https://discs");
	});
});

describe("DiscReleasesList", () => {
	it("lists releases per country and marks upcoming ones", () => {
		render(
			<DiscReleasesList
				discs={{
					releases: [
						{ region: "IE", date: "2024-06-10", formats: [] },
						{ region: "US", date: "2030-01-01", formats: ["uhd", "bluray"] },
					],
					formats: ["uhd", "bluray"],
				}}
				discLink="https://discs"
				today="2026-11-03"
			/>,
		);
		expect(screen.getByText("Format not listed")).toBeInTheDocument();
		expect(screen.getByText("4K UHD Blu-ray, Blu-ray")).toBeInTheDocument();
		expect(screen.getByText(/Ireland/)).toBeInTheDocument();
		expect(screen.getByText(/Coming/)).toBeInTheDocument();
	});
});
