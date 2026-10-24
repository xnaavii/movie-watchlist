import type { PersonResultItem } from "@lorenzopant/tmdb";

/** What ranking needs from a search result. */
type RankableTitle = {
	title: string;
	originalTitle?: string;
	popularity?: number;
};

const YEAR_PATTERN = /^(.*?)[\s,]*\(?((?:18|19|20)\d{2})\)?$/;
const MIN_FALLBACK_QUERY_LENGTH = 3;
const MAX_FALLBACK_QUERIES = 4;
const PERSON_DEPARTMENTS = new Set(["Acting", "Directing", "Writing"]);

export type ParsedSearchQuery = {
	title: string;
	year?: string;
};

/** Lowercases, strips accents and punctuation, and collapses whitespace. */
export function normalizeText(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^\p{L}\p{N}]+/gu, " ")
		.trim();
}

/** Splits a trailing release year off the query, e.g. "dune 2021" or "Dune (2021)". */
export function parseSearchQuery(raw: string): ParsedSearchQuery {
	const query = raw.trim().replace(/\s+/g, " ");
	const match = query.match(YEAR_PATTERN);
	if (!match || !match[1].trim()) return { title: query };
	return { title: match[1].trim(), year: match[2] };
}

function levenshtein(a: string, b: string): number {
	if (a === b) return 0;
	if (!a.length) return b.length;
	if (!b.length) return a.length;

	let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		const current = [i];
		for (let j = 1; j <= b.length; j++) {
			current[j] = Math.min(
				previous[j] + 1,
				current[j - 1] + 1,
				previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
		}
		previous = current;
	}
	return previous[b.length];
}

function similarity(a: string, b: string): number {
	const longest = Math.max(a.length, b.length);
	return longest === 0 ? 1 : 1 - levenshtein(a, b) / longest;
}

/**
 * Scores how closely a title matches a query, from 0 to 1. Compares against the
 * whole title and against every run of title words as long as the query, so
 * "intersteller" matches "Interstellar" and "rings" matches "The Lord of the Rings".
 */
export function titleSimilarity(query: string, title: string): number {
	const q = normalizeText(query);
	const t = normalizeText(title);
	if (!q || !t) return 0;
	if (q === t) return 1;

	const compactQuery = q.replace(/ /g, "");
	let best = Math.max(
		similarity(q, t),
		similarity(compactQuery, t.replace(/ /g, "")),
	);

	const titleWords = t.split(" ");
	const size = q.split(" ").length;
	for (let start = 0; start + size <= titleWords.length; start++) {
		const window = titleWords.slice(start, start + size).join(" ");
		best = Math.max(best, similarity(q, window) * 0.95);
	}
	return best;
}

/** Lower is better: exact title, then title starting with the query, then the rest. */
function matchTier(query: string, movie: RankableTitle): number {
	const q = normalizeText(query);
	const titles = [movie.title, movie.originalTitle ?? ""].map(normalizeText);
	if (titles.some((title) => title === q)) return 0;
	if (titles.some((title) => title.startsWith(`${q} `))) return 1;
	return 2;
}

/**
 * Puts exact and prefix title matches first, most popular first within each, so
 * "dune" leads with the 2021 film. Works for movies and TV shows alike. Everything else keeps TMDB's relevance order.
 */
export function rankSearchResults<T extends RankableTitle>(
	query: string,
	results: T[],
): T[] {
	return results
		.map((movie, index) => ({ movie, index, tier: matchTier(query, movie) }))
		.sort((a, b) => {
			if (a.tier !== b.tier) return a.tier - b.tier;
			if (a.tier < 2)
				return (b.movie.popularity ?? 0) - (a.movie.popularity ?? 0);
			return a.index - b.index;
		})
		.map(({ movie }) => movie);
}

/** Orders loose fallback matches by how close their title is to what was typed. */
export function rankFuzzyResults<T extends RankableTitle>(
	query: string,
	results: T[],
): T[] {
	const score = (movie: T) =>
		Math.max(
			titleSimilarity(query, movie.title),
			titleSimilarity(query, movie.originalTitle ?? ""),
		);
	return results
		.map((movie) => ({ movie, score: score(movie) }))
		.sort(
			(a, b) =>
				b.score - a.score ||
				(b.movie.popularity ?? 0) - (a.movie.popularity ?? 0),
		)
		.map(({ movie }) => movie);
}

/**
 * Looser queries to try when the exact one finds nothing. TMDB matches word
 * prefixes, so trimming the end of a misspelt word ("intersteller" to
 * "interstel") usually lands on the right title.
 */
export function buildFallbackQueries(query: string): string[] {
	const normalized = normalizeText(query);
	const candidates: string[] = [];
	const add = (candidate: string) => {
		const trimmed = candidate.trim();
		if (
			trimmed.length >= MIN_FALLBACK_QUERY_LENGTH &&
			trimmed !== query.trim().toLowerCase() &&
			!candidates.includes(trimmed)
		) {
			candidates.push(trimmed);
		}
	};

	add(normalized);

	const words = normalized.split(" ");
	const lastWord = words.at(-1) ?? "";
	const head = words.slice(0, -1).join(" ");
	const minLength = Math.max(
		MIN_FALLBACK_QUERY_LENGTH,
		Math.ceil(lastWord.length * 0.6),
	);
	for (let length = lastWord.length - 2; length >= minLength; length -= 2) {
		add(`${head} ${lastWord.slice(0, length)}`);
	}

	if (words.length > 1) {
		const longestWord = [...words].sort((a, b) => b.length - a.length)[0];
		add(longestWord);
	}

	return candidates.slice(0, MAX_FALLBACK_QUERIES);
}

/**
 * True when the query is clearly a person's name ("tom hanks", "nolan") rather
 * than a title: every query word closely matches a word in the name.
 */
export function isPersonMatch(
	query: string,
	person: PersonResultItem,
): boolean {
	if (!PERSON_DEPARTMENTS.has(person.known_for_department)) return false;

	const queryWords = normalizeText(query).split(" ").filter(Boolean);
	const nameWords = normalizeText(person.name).split(" ");
	if (queryWords.join("").length < 4) return false;

	return queryWords.every((queryWord) =>
		nameWords.some(
			(nameWord) =>
				nameWord === queryWord ||
				(queryWord.length >= 4 && similarity(queryWord, nameWord) >= 0.8),
		),
	);
}
