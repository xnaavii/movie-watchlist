import { env } from "cloudflare:workers";
import type {
	DiscoverMovieParams,
	DiscoverTVParams,
	MovieImages,
	MovieVideos,
	PaginatedResponse,
	Review,
	TrendingTimeWindow,
	WatchProvider,
} from "@lorenzopant/tmdb";
import { TMDBError } from "@lorenzopant/tmdb";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { imdbRating, streamingSource } from "#/db/schema";
import { DAY, edgeCached, HOUR } from "#/lib/edgeCache";
import { tmdb } from "#/lib/tmdb";
import { watchmode } from "#/lib/watchmode";
import type {
	MediaDetails,
	MediaItem,
	MediaListRequest,
	MediaPage,
	MediaRef,
	MediaType,
	OmdbResponse,
	ResolvedSearch,
	SearchPerson,
	SmartSearchParams,
	SmartSearchResponse,
} from "../types";
import {
	interleave,
	mediaKey,
	normalizeMovie,
	normalizeMovieDetails,
	normalizeTVDetails,
	normalizeTVShow,
	toLogoUrl,
} from "../utils";
import {
	buildFallbackQueries,
	isPersonMatch,
	parseSearchQuery,
	rankFuzzyResults,
	rankSearchResults,
} from "../utils/search";
import {
	pickLogo,
	type ShowcaseMovie,
	selectShowcaseCandidates,
	toShowcaseMovie,
} from "../utils/showcase";

const OMDB_API_KEY = env.OMDB_API_KEY;
const IMDB_RATING_TTL_MS = 24 * 60 * 60 * 1000;
const STREAMING_SOURCE_TTL_MS = 24 * 60 * 60 * 1000;
const PERSON_CREDIT_LIMIT = 20;

/** Runs a TMDB call and turns its failures into a readable error. */
async function fromTmdb<T>(
	request: () => Promise<T>,
	fallbackMessage: string,
	/** Shares the result between visitors for this long. Failures aren't kept. */
	cache?: { key: string; ttl: number },
): Promise<T> {
	try {
		return cache
			? await edgeCached(cache.key, cache.ttl, request)
			: await request();
	} catch (error) {
		throw new Error(
			error instanceof TMDBError ? error.message : fallbackMessage,
		);
	}
}

const label = (mediaType: MediaType) =>
	mediaType === "movie" ? "movie" : "TV show";

function toMoviePage(
	page: PaginatedResponse<Parameters<typeof normalizeMovie>[0]>,
): MediaPage {
	return { ...page, results: page.results.map(normalizeMovie) };
}

function toTVPage(
	page: PaginatedResponse<Parameters<typeof normalizeTVShow>[0]>,
): MediaPage {
	return { ...page, results: page.results.map(normalizeTVShow) };
}

type WithPage = { page?: number };

export const getMediaDetails = createServerFn({ method: "GET" })
	.validator((data: MediaRef) => data)
	.handler(
		({ data }): Promise<MediaDetails> =>
			fromTmdb(
				async () => {
					if (data.mediaType === "movie") {
						const movie = await tmdb.movies.details({ movie_id: data.id });
						return normalizeMovieDetails(movie);
					}
					const [show, externalIds] = await Promise.all([
						tmdb.tv_series.details({ series_id: data.id }),
						tmdb.tv_series
							.external_ids({ series_id: data.id })
							.catch(() => undefined),
					]);
					return normalizeTVDetails(show, externalIds?.imdb_id);
				},
				`Failed to get the ${label(data.mediaType)} details`,
				{ key: `getMediaDetails:${JSON.stringify(data)}`, ttl: DAY },
			),
	);

export const getMediaList = createServerFn({ method: "GET" })
	.validator((data: MediaListRequest & WithPage) => data)
	.handler(
		({ data }): Promise<MediaPage> =>
			fromTmdb(
				async () => {
					const params = { page: data.page };
					if (data.mediaType === "tv") {
						switch (data.list) {
							case "popular":
								return toTVPage(await tmdb.tv_lists.popular(params));
							case "airing_today":
								return toTVPage(await tmdb.tv_lists.airing_today(params));
							case "on_the_air":
								return toTVPage(await tmdb.tv_lists.on_the_air(params));
							case "top_rated":
								return toTVPage(await tmdb.tv_lists.top_rated(params));
							default:
								data satisfies never;
								throw new Error("Unknown TV list type");
						}
					}
					switch (data.list) {
						case "popular":
							return toMoviePage(await tmdb.movie_lists.popular(params));
						case "now_playing":
							return toMoviePage(await tmdb.movie_lists.now_playing(params));
						case "upcoming":
							return toMoviePage(await tmdb.movie_lists.upcoming(params));
						case "top_rated":
							return toMoviePage(await tmdb.movie_lists.top_rated(params));
						default:
							data satisfies never;
							throw new Error("Unknown movie list type");
					}
				},
				"Failed to get the list",
				{ key: `getMediaList:${JSON.stringify(data)}`, ttl: 3 * HOUR },
			),
	);

export const getMediaRecommendations = createServerFn({ method: "GET" })
	.validator((data: MediaRef & WithPage) => data)
	.handler(
		({ data }): Promise<MediaPage> =>
			fromTmdb(
				async () =>
					data.mediaType === "movie"
						? toMoviePage(
								await tmdb.movies.recommendations({
									movie_id: data.id,
									page: data.page,
								}),
							)
						: toTVPage(
								await tmdb.tv_series.recommendations({
									series_id: data.id,
									page: data.page,
								}),
							),
				"Failed to get recommendations",
				{ key: `getMediaRecommendations:${JSON.stringify(data)}`, ttl: DAY },
			),
	);

export const getMediaReviews = createServerFn({ method: "GET" })
	.validator((data: MediaRef & WithPage) => data)
	.handler(
		({ data }): Promise<PaginatedResponse<Review>> =>
			fromTmdb(
				() =>
					data.mediaType === "movie"
						? tmdb.movies.reviews({ movie_id: data.id, page: data.page })
						: tmdb.tv_series.reviews({ series_id: data.id, page: data.page }),
				"Failed to get reviews",
				{ key: `getMediaReviews:${JSON.stringify(data)}`, ttl: DAY },
			),
	);

export const getMediaCredits = createServerFn({ method: "GET" })
	.validator((data: MediaRef) => data)
	.handler(({ data }) =>
		fromTmdb(
			() =>
				data.mediaType === "movie"
					? tmdb.movies.credits({ movie_id: data.id })
					: tmdb.tv_series.credits({ series_id: data.id }),
			"Failed to get the credits",
			{ key: `getMediaCredits:${JSON.stringify(data)}`, ttl: DAY },
		),
	);

export const getMediaVideos = createServerFn({ method: "GET" })
	.validator((data: MediaRef) => data)
	.handler(
		({ data }): Promise<MovieVideos> =>
			fromTmdb(
				() =>
					data.mediaType === "movie"
						? tmdb.movies.videos({ movie_id: data.id })
						: tmdb.tv_series.videos({ series_id: data.id }),
				"Failed to get the videos",
				{ key: `getMediaVideos:${JSON.stringify(data)}`, ttl: DAY },
			),
	);

/** Most titles a row or carousel shows at once. */
const MAX_LOGO_TITLES = 24;

/**
 * Logo URLs for a whole row in one request, keyed by mediaKey. Sends only the
 * paths, not every poster and backdrop TMDB lists. A missing logo is undefined.
 */
export const getMediaLogos = createServerFn({ method: "GET" })
	.validator((refs: MediaRef[]) =>
		refs
			.slice(0, MAX_LOGO_TITLES)
			.map(({ mediaType, id }): MediaRef => ({ mediaType, id })),
	)
	.handler(async ({ data }) => {
		const entries = await Promise.all(
			data.map(async (ref) => {
				try {
					// Null rather than undefined, so "no logo" can be cached too.
					const logo = await edgeCached(
						`mediaLogo:${mediaKey(ref)}`,
						DAY,
						async () => {
							const images =
								ref.mediaType === "movie"
									? await tmdb.movies.images({
											movie_id: ref.id,
											include_image_language: ["en", "null"],
										})
									: await tmdb.tv_series.images({
											series_id: ref.id,
											include_image_language: ["en", "null"],
										});
							return toLogoUrl(images) ?? null;
						},
					);
					return [mediaKey(ref), logo ?? undefined] as const;
				} catch {
					return [mediaKey(ref), undefined] as const;
				}
			}),
		);
		return Object.fromEntries(entries) as Record<string, string | undefined>;
	});

export const getMediaImages = createServerFn({ method: "GET" })
	.validator(
		(
			data: MediaRef & {
				language?: "en";
				include_image_language?: ("en" | "null")[];
			},
		) => data,
	)
	.handler(
		({ data }): Promise<MovieImages> =>
			fromTmdb(
				() => {
					const { mediaType, id, ...params } = data;
					return mediaType === "movie"
						? tmdb.movies.images({ movie_id: id, ...params })
						: tmdb.tv_series.images({
								series_id: id,
								include_image_language: params.include_image_language,
							});
				},
				"Failed to get images",
				{ key: `getMediaImages:${JSON.stringify(data)}`, ttl: DAY },
			),
	);

export const getMediaWatchProviders = createServerFn({ method: "GET" })
	.validator((data: MediaRef) => data)
	.handler(
		({ data }): Promise<{ results: Record<string, WatchProvider> }> =>
			fromTmdb(
				() =>
					data.mediaType === "movie"
						? tmdb.movies.watch_providers({ movie_id: data.id })
						: tmdb.tv_series.watch_providers({ series_id: data.id }),
				`Failed to get where to watch the ${label(data.mediaType)}`,
				{
					key: `getMediaWatchProviders:${JSON.stringify(data)}`,
					ttl: 6 * HOUR,
				},
			),
	);

export const getMediaGenres = createServerFn({ method: "GET" })
	.validator((data: { mediaType: MediaType }) => data)
	.handler(({ data }) =>
		fromTmdb(
			() =>
				data.mediaType === "movie"
					? tmdb.genres.movie_list({})
					: tmdb.genres.tv_list({}),
			"Failed to get genres",
			{ key: `getMediaGenres:${JSON.stringify(data)}`, ttl: 7 * DAY },
		),
	);

export const getLanguages = createServerFn({ method: "GET" }).handler(() =>
	fromTmdb(() => tmdb.configuration.languages(), "Failed to get languages", {
		key: "getLanguages",
		ttl: 7 * DAY,
	}),
);

export type MediaDiscoverRequest =
	| { mediaType: "movie"; params: DiscoverMovieParams }
	| { mediaType: "tv"; params: DiscoverTVParams };

export const discoverMedia = createServerFn({ method: "GET" })
	.validator((data: MediaDiscoverRequest) => data)
	.handler(
		({ data }): Promise<MediaPage> =>
			fromTmdb(
				async () =>
					data.mediaType === "movie"
						? toMoviePage(await tmdb.discover.movie(data.params))
						: toTVPage(await tmdb.discover.tv(data.params)),
				"Failed to get results",
				{ key: `discoverMedia:${JSON.stringify(data)}`, ttl: 3 * HOUR },
			),
	);

export const getTrendingMedia = createServerFn({ method: "GET" })
	.validator(
		(data: {
			mediaType: MediaType;
			time_window: TrendingTimeWindow;
			page?: number;
		}) => data,
	)
	.handler(
		({ data }): Promise<MediaPage> =>
			fromTmdb(
				async () => {
					const { mediaType, ...params } = data;
					return mediaType === "movie"
						? toMoviePage(await tmdb.trending.movies(params))
						: toTVPage(await tmdb.trending.tv(params));
				},
				"Failed to get what's trending",
				{ key: `getTrendingMedia:${JSON.stringify(data)}`, ttl: HOUR },
			),
	);

/**
 * Searches movies and TV shows together. The first page also looks for a
 * person the query names.
 */
export const searchMedia = createServerFn({ method: "GET" })
	.validator((data: SmartSearchParams) => data)
	.handler(
		({ data }): Promise<SmartSearchResponse> =>
			fromTmdb(async () => {
				const page = data.page ?? 1;

				if (data.resolved && page > 1) {
					const response = await searchBoth(data.resolved, page);
					return {
						...response,
						results: rankResults(data.query, response.results, data.resolved),
						resolved: data.resolved,
						person: null,
					};
				}

				const [results, person] = await Promise.all([
					findMedia(data.query),
					findPerson(data.query),
				]);
				return { ...results, person };
			}, "Failed to get search results"),
	);

/** One page of movie and TV results, interleaved so neither drowns the other. */
async function searchBoth(
	{ query, year }: ResolvedSearch,
	page?: number,
): Promise<MediaPage> {
	const [movies, shows] = await Promise.all([
		tmdb.search.movies({ query, year, page }),
		tmdb.search.tv_series({
			query,
			first_air_date_year: year ? Number(year) : undefined,
			page,
		}),
	]);
	return {
		page: page ?? 1,
		total_pages: Math.max(movies.total_pages, shows.total_pages),
		total_results: movies.total_results + shows.total_results,
		results: interleave(
			movies.results.map(normalizeMovie),
			shows.results.map(normalizeTVShow),
		),
	};
}

function rankResults(
	query: string,
	results: MediaItem[],
	resolved: ResolvedSearch,
) {
	return resolved.fuzzy
		? rankFuzzyResults(query, results)
		: rankSearchResults(parseSearchQuery(query).title, results);
}

/**
 * Tries the query as typed (with any trailing year used as a filter), then
 * without the year filter, then looser spellings, and returns the first that
 * finds something.
 */
async function findMedia(query: string) {
	const { title, year } = parseSearchQuery(query);
	const attempts: ResolvedSearch[] = [
		{ query: title, year, fuzzy: false },
		...(year ? [{ query, fuzzy: false }] : []),
		...buildFallbackQueries(title).map((fallback) => ({
			query: fallback,
			fuzzy: true,
		})),
	];

	let response: MediaPage | undefined;
	for (const resolved of attempts) {
		response = await searchBoth(resolved);
		if (response.results.length > 0) {
			return {
				...response,
				results: rankResults(query, response.results, resolved),
				resolved,
			};
		}
	}

	return {
		page: 1,
		total_pages: 0,
		total_results: 0,
		...response,
		results: [],
		resolved: attempts[0],
	};
}

/** When the query names an actor or director, returns what they're known for. */
async function findPerson(query: string): Promise<SearchPerson | null> {
	try {
		const { results } = await tmdb.search.person({ query });
		const person = results[0];
		if (!person || !isPersonMatch(query, person)) return null;

		const credits = await tmdb.people.combined_credits({
			person_id: person.id,
		});
		const relevant =
			person.known_for_department === "Acting"
				? credits.cast
				: credits.crew.filter(
						(credit) => credit.department === person.known_for_department,
					);

		const unique = new Map<string, MediaItem & { voteCount: number }>();
		for (const credit of relevant) {
			if (!credit.poster_path) continue;
			const item =
				credit.media_type === "movie"
					? normalizeMovie(credit)
					: normalizeTVShow(credit);
			// Talk and award shows list everyone, so TV only counts for real roles.
			if (credit.media_type === "tv" && "episode_count" in credit) {
				if ((credit.episode_count ?? 0) < 3) continue;
			}
			const key = `${item.mediaType}:${item.id}`;
			if (!unique.has(key)) {
				unique.set(key, { ...item, voteCount: item.voteCount ?? 0 });
			}
		}

		const knownFor = [...unique.values()]
			.sort((a, b) => b.voteCount - a.voteCount)
			.slice(0, PERSON_CREDIT_LIMIT);
		if (knownFor.length === 0) return null;

		return { id: person.id, name: person.name, credits: knownFor };
	} catch {
		return null;
	}
}

/**
 * Trending movies with their logos for the auth page showcase. Never throws:
 * an empty list tells the page to keep its stock background.
 */
export const getAuthShowcase = createServerFn({ method: "GET" }).handler(
	async (): Promise<ShowcaseMovie[]> => {
		try {
			const [trending, genres] = await Promise.all([
				tmdb.trending.movies({ time_window: "week" }),
				tmdb.genres.movie_list({}),
			]);
			const candidates = selectShowcaseCandidates(trending.results);
			const logos = await Promise.all(
				candidates.map((movie) =>
					tmdb.movies
						.images({
							movie_id: movie.id,
							include_image_language: ["en", "null"],
						})
						.then((images) => pickLogo(images.logos))
						.catch(() => null),
				),
			);
			return candidates
				.map((movie, i) => toShowcaseMovie(movie, genres.genres, logos[i]))
				.filter((movie): movie is ShowcaseMovie => movie !== null);
		} catch {
			return [];
		}
	},
);

export const getStreamingSources = createServerFn({ method: "GET" })
	.validator((data: { imdbId: string }) => data)
	.handler(async ({ data }) => {
		if (!data.imdbId) {
			throw new Error("Please provide imdb id");
		}

		const cached = await db.query.streamingSource.findFirst({
			where: eq(streamingSource.imdbId, data.imdbId),
		});

		const isFresh =
			cached &&
			Date.now() - cached.fetchedAt.getTime() < STREAMING_SOURCE_TTL_MS;

		if (isFresh) {
			return cached.sources;
		}

		if (!env.WATCHMODE_API_KEY) {
			throw new Error("Please provide WATCHMODE_API_KEY");
		}

		const { data: sources, error } = await watchmode.title.getSources(
			data.imdbId,
		);

		if (error) {
			if (cached) return cached.sources;
			throw new Error("Failed to fetch streaming sources");
		}

		await db
			.insert(streamingSource)
			.values({ imdbId: data.imdbId, sources, fetchedAt: new Date() })
			.onConflictDoUpdate({
				target: streamingSource.imdbId,
				set: { sources, fetchedAt: new Date() },
			});

		return sources;
	});

export const getImdbRating = createServerFn({ method: "GET" })
	.validator((data: { imdbId: string }) => data)
	.handler(async ({ data }) => {
		if (!data.imdbId) {
			throw new Error("Please provide imdb id");
		}

		const cached = await db.query.imdbRating.findFirst({
			where: eq(imdbRating.imdbId, data.imdbId),
		});

		const isFresh =
			cached && Date.now() - cached.fetchedAt.getTime() < IMDB_RATING_TTL_MS;

		if (isFresh) {
			return {
				imdbRating: cached.imdbRating,
				imdbVotes: cached.imdbVotes,
			};
		}

		if (!OMDB_API_KEY) {
			throw new Error("Please provide OMDB_API_KEY");
		}

		const response = await fetch(
			`https://www.omdbapi.com/?i=${data.imdbId}&apikey=${OMDB_API_KEY}`,
		);

		const result: OmdbResponse = await response.json();

		if (result.Response === "False") {
			if (cached) {
				return {
					imdbRating: cached.imdbRating,
					imdbVotes: cached.imdbVotes,
				};
			}
			throw new Error(result.Error ?? "OMDb returned no result");
		}

		await db
			.insert(imdbRating)
			.values({
				imdbId: data.imdbId,
				imdbRating: result.imdbRating,
				imdbVotes: result.imdbVotes,
				fetchedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: imdbRating.imdbId,
				set: {
					imdbRating: result.imdbRating,
					imdbVotes: result.imdbVotes,
					fetchedAt: new Date(),
				},
			});

		return {
			imdbRating: result.imdbRating,
			imdbVotes: result.imdbVotes,
		};
	});
