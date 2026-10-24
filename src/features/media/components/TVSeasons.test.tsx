import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { MediaDetails } from "../types";
import { TVSeasons } from "./TVSeasons";

const show: MediaDetails = {
	id: 1399,
	mediaType: "tv",
	title: "Game of Thrones",
	genres: [],
	numberOfSeasons: 8,
	numberOfEpisodes: 73,
	seasons: Array.from({ length: 8 }, (_, i) => ({
		id: i + 1,
		seasonNumber: i + 1,
		name: `Season ${i + 1}`,
		episodeCount: i === 7 ? 6 : 10,
		airDate: `${2011 + i}-04-17`,
	})),
	nextEpisode: {
		name: "The Iron Throne",
		seasonNumber: 8,
		episodeNumber: 6,
		airDate: "2019-05-19",
	},
};

describe("TVSeasons", () => {
	it("summarises seasons and episodes", () => {
		render(<TVSeasons show={show} />);
		expect(screen.getByText("8 seasons · 73 episodes")).toBeInTheDocument();
	});

	it("highlights the next episode", () => {
		render(<TVSeasons show={show} />);
		expect(screen.getByText(/Next episode · Sun, May 19/)).toBeInTheDocument();
		expect(screen.getByText("S8 E6")).toBeInTheDocument();
	});

	it("lists the newest seasons first and reveals the rest on demand", async () => {
		render(<TVSeasons show={show} />);
		const names = screen
			.getAllByText(/^Season \d$/)
			.map((el) => el.textContent);
		expect(names).toEqual([
			"Season 8",
			"Season 7",
			"Season 6",
			"Season 5",
			"Season 4",
		]);
		expect(screen.getByText("6 episodes · 2018")).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole("button", { name: /Show all 8 seasons/ }),
		);
		expect(screen.getByText("Season 1")).toBeInTheDocument();
	});

	it("renders nothing without seasons", () => {
		const { container } = render(<TVSeasons show={{ ...show, seasons: [] }} />);
		expect(container).toBeEmptyDOMElement();
	});
});
