import { describe, expect, it } from "vitest";
import type { MediaDetails } from "../types";
import { buildMediaHead } from "./meta";

const movie: MediaDetails = {
	id: 550,
	mediaType: "movie",
	title: "Fight Club",
	overview: "A ticking-time-bomb insomniac </script><script>alert(1)</script>",
	tagline: "Mischief. Mayhem. Soap.",
	releaseDate: "1999-10-15",
	runtime: 139,
	genres: [{ id: 18, name: "Drama" }],
	backdropPath: "https://image.tmdb.org/t/p/original/backdrop.jpg",
	posterPath: "/poster.jpg",
	voteAverage: 8.438,
	voteCount: 30000,
};

const show: MediaDetails = {
	id: 1399,
	mediaType: "tv",
	title: "Game of Thrones",
	overview: "Seven noble families fight for control of Westeros.",
	releaseDate: "2011-04-17",
	runtime: 60,
	numberOfSeasons: 8,
	numberOfEpisodes: 73,
	genres: [{ id: 18, name: "Drama" }],
	backdropPath: "/got.jpg",
	voteAverage: 8.5,
	voteCount: 25000,
};

const url = "https://watchlist.example.com/movies/550";

const content = (head: ReturnType<typeof buildMediaHead>, key: string) =>
	head.meta.find(
		(tag) =>
			("property" in tag && tag.property === key) ||
			("name" in tag && tag.name === key),
	)?.content;

describe("buildMediaHead", () => {
	it("builds an absolute, sized preview image from the backdrop", () => {
		const head = buildMediaHead(movie, url);
		expect(content(head, "og:image")).toBe(
			"https://image.tmdb.org/t/p/w1280/backdrop.jpg",
		);
		expect(content(head, "twitter:card")).toBe("summary_large_image");
	});

	it("falls back to the poster with a small card when there is no backdrop", () => {
		const head = buildMediaHead({ ...movie, backdropPath: undefined }, url);
		expect(content(head, "og:image")).toBe(
			"https://image.tmdb.org/t/p/w780/poster.jpg",
		);
		expect(content(head, "twitter:card")).toBe("summary");
	});

	it("includes the year in the title and points og:url and canonical at the page", () => {
		const head = buildMediaHead(movie, url);
		expect(head.meta[0]).toEqual({
			title: "Fight Club (1999) | Watchlist",
		});
		expect(content(head, "og:url")).toBe(url);
		expect(content(head, "og:type")).toBe("video.movie");
		expect(head.links).toEqual([{ rel: "canonical", href: url }]);
	});

	it("emits Movie JSON-LD that cannot break out of its script tag", () => {
		const [script] = buildMediaHead(movie, url).scripts;
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

	it("emits TVSeries JSON-LD and a TV og:type for shows", () => {
		const head = buildMediaHead(show, "https://watchlist.example.com/tv/1399");
		expect(content(head, "og:type")).toBe("video.tv_show");
		expect(content(head, "video:duration")).toBeUndefined();
		const data = JSON.parse(head.scripts[0].children);
		expect(data).toMatchObject({
			"@type": "TVSeries",
			name: "Game of Thrones",
			startDate: "2011-04-17",
			numberOfSeasons: 8,
			numberOfEpisodes: 73,
		});
		expect(data.duration).toBeUndefined();
	});
});
