import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "#/__tests__/RenderWithRouter";
import { MovieCard } from "./MovieCard";

describe("MovieCard", async () => {
	it("renders the movie title as the card's title attribute", async () => {
		await renderWithRouter(
			<MovieCard id={27205} title="Inception" posterPath={null} />,
		);
		expect(screen.getByTitle("Inception")).toBeInTheDocument();
	});

	it("renders a fallback when there is no poster", async () => {
		await renderWithRouter(
			<MovieCard id={27205} title="Inception" posterPath={null} />,
		);
		expect(screen.getByText("No image")).toBeInTheDocument();
	});

	it("renders the poster image when a path is provided", async () => {
		await renderWithRouter(
			<MovieCard
				id={27205}
				title="Inception"
				posterPath="https://image.tmdb.org/t/p/w500/poster.jpg"
			/>,
		);
		const img = screen.getByAltText("Inception");
		expect(img).toHaveAttribute(
			"src",
			"https://image.tmdb.org/t/p/w500/poster.jpg",
		);
	});

	it("links to the movie details page using the given id", async () => {
		await renderWithRouter(
			<MovieCard id={27205} title="Inception" posterPath={null} />,
		);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/movies/27205");
	});

	it("shows the watchlist badge with a tooltip when status is watched", async () => {
		await renderWithRouter(
			<MovieCard
				id={27205}
				title="Inception"
				posterPath={null}
				watchlistStatus="watched"
			/>,
		);
		expect(screen.getByTitle("Watched")).toBeInTheDocument();
	});

	it("shows the watchlist badge with a tooltip when status is want_to_watch", async () => {
		await renderWithRouter(
			<MovieCard
				id={27205}
				title="Inception"
				posterPath={null}
				watchlistStatus="want_to_watch"
			/>,
		);
		expect(screen.getByTitle("Want to watch")).toBeInTheDocument();
	});

	it("shows no watchlist badge when status is null", async () => {
		await renderWithRouter(
			<MovieCard
				id={27205}
				title="Inception"
				posterPath={null}
				watchlistStatus={null}
			/>,
		);
		expect(screen.queryByTitle("Watched")).not.toBeInTheDocument();
		expect(screen.queryByTitle("Want to watch")).not.toBeInTheDocument();
	});
});
