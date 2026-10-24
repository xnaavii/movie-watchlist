import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "#/__tests__/RenderWithRouter";
import type { MediaItem } from "../types";
import { MediaCard } from "./MediaCard";

const inception: MediaItem = {
	id: 27205,
	mediaType: "movie",
	title: "Inception",
	posterPath: null,
	releaseDate: "2010-07-15",
};

const breakingBad: MediaItem = {
	id: 1396,
	mediaType: "tv",
	title: "Breaking Bad",
	posterPath: null,
	releaseDate: "2008-01-20",
};

describe("MediaCard", () => {
	it("renders the title as the card's title attribute", async () => {
		await renderWithRouter(<MediaCard media={inception} />);
		expect(screen.getByTitle("Inception")).toBeInTheDocument();
	});

	it("renders a fallback when there is no poster", async () => {
		await renderWithRouter(<MediaCard media={inception} />);
		expect(screen.getByText("No image")).toBeInTheDocument();
	});

	it("renders the poster image when a path is provided", async () => {
		await renderWithRouter(
			<MediaCard
				media={{
					...inception,
					posterPath: "https://image.tmdb.org/t/p/w500/poster.jpg",
				}}
			/>,
		);
		const img = screen.getByAltText("Inception");
		expect(img).toHaveAttribute(
			"src",
			"https://image.tmdb.org/t/p/w500/poster.jpg",
		);
	});

	it("links movies to their details page with a readable slug", async () => {
		await renderWithRouter(<MediaCard media={inception} />);
		expect(screen.getByRole("link")).toHaveAttribute(
			"href",
			"/movies/27205-inception",
		);
	});

	it("links TV shows to the TV details page", async () => {
		await renderWithRouter(<MediaCard media={breakingBad} />);
		expect(screen.getByRole("link")).toHaveAttribute(
			"href",
			"/tv/1396-breaking-bad",
		);
	});

	it("labels the media type and year", async () => {
		await renderWithRouter(<MediaCard media={breakingBad} />);
		expect(screen.getByText("TV show · 2008")).toBeInTheDocument();
	});

	it("shows the watched badge when status is watched", async () => {
		await renderWithRouter(
			<MediaCard media={inception} watchlistStatus="watched" />,
		);
		expect(screen.getByTitle("Watched")).toBeInTheDocument();
	});

	it("shows the watchlist badge when status is want_to_watch", async () => {
		await renderWithRouter(
			<MediaCard media={inception} watchlistStatus="want_to_watch" />,
		);
		expect(screen.getByTitle("In the Watchlist")).toBeInTheDocument();
	});

	it("shows no watchlist badge when status is null", async () => {
		await renderWithRouter(
			<MediaCard media={inception} watchlistStatus={null} />,
		);
		expect(screen.queryByTitle("Watched")).not.toBeInTheDocument();
		expect(screen.queryByTitle("In the Watchlist")).not.toBeInTheDocument();
	});
});
