import type { MovieDetails } from "@lorenzopant/tmdb";
import { describe, expect, it } from "vitest";
import { buildMovieHead } from "./meta";

const movie = {
	id: 550,
	title: "Fight Club",
	overview: "A ticking-time-bomb insomniac </script><script>alert(1)</script>",
	tagline: "Mischief. Mayhem. Soap.",
	release_date: "1999-10-15",
	runtime: 139,
	genres: [{ id: 18, name: "Drama" }],
	backdrop_path: "https://image.tmdb.org/t/p/original/backdrop.jpg",
	poster_path: "/poster.jpg",
	vote_average: 8.438,
	vote_count: 30000,
} as unknown as MovieDetails;

const url = "https://watchlist.example.com/movies/550";

const content = (head: ReturnType<typeof buildMovieHead>, key: string) =>
	head.meta.find(
		(tag) =>
			("property" in tag && tag.property === key) ||
			("name" in tag && tag.name === key),
	)?.content;

describe("buildMovieHead", () => {
	it("builds an absolute, sized preview image from the backdrop", () => {
		const head = buildMovieHead(movie, url);
		expect(content(head, "og:image")).toBe(
			"https://image.tmdb.org/t/p/w1280/backdrop.jpg",
		);
		expect(content(head, "twitter:card")).toBe("summary_large_image");
	});

	it("falls back to the poster with a small card when there is no backdrop", () => {
		const head = buildMovieHead(
			{ ...movie, backdrop_path: undefined } as MovieDetails,
			url,
		);
		expect(content(head, "og:image")).toBe(
			"https://image.tmdb.org/t/p/w780/poster.jpg",
		);
		expect(content(head, "twitter:card")).toBe("summary");
	});

	it("includes the year in the title and points og:url and canonical at the page", () => {
		const head = buildMovieHead(movie, url);
		expect(head.meta[0]).toEqual({
			title: "Fight Club (1999) | Movie Watchlist",
		});
		expect(content(head, "og:url")).toBe(url);
		expect(content(head, "og:type")).toBe("video.movie");
		expect(head.links).toEqual([{ rel: "canonical", href: url }]);
	});

	it("emits Movie JSON-LD that cannot break out of its script tag", () => {
		const [script] = buildMovieHead(movie, url).scripts;
		expect(script.children).not.toContain("</script>");
		const data = JSON.parse(script.children);
		expect(data).toMatchObject({
			"@type": "Movie",
			name: "Fight Club",
			datePublished: "1999-10-15",
			duration: "PT139M",
			genre: ["Drama"],
			aggregateRating: { ratingValue: 8.4, ratingCount: 30000 },
		});
	});
});
