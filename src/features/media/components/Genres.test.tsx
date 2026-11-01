import { describe, expect, it } from "vitest";
import { uniqueGenres } from "./Genres";

describe("uniqueGenres", () => {
	it("drops genres whose name already appeared", () => {
		// Movie and TV genre lists both include Mystery, so merged lists repeat it.
		const genres = [
			{ id: 9648, name: "Mystery" },
			{ id: 53, name: "Thriller" },
			{ id: 9648, name: "Mystery" },
		];

		expect(uniqueGenres(genres).map((genre) => genre.name)).toEqual([
			"Mystery",
			"Thriller",
		]);
	});
});
