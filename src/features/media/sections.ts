import type { DiscoverMovieParams, DiscoverTVParams } from "@lorenzopant/tmdb";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { type DiscoverGenre, hasMediaType, toWithGenres } from "./genres";
import {
	discoverMedia,
	getMediaList,
	getTrendingMedia,
} from "./server/media.functions";
import type { MediaPage, MediaType, TMDBMovieList, TMDBTVList } from "./types";
import {
	buildAiringThisWeekParams,
	buildComingSoonParams,
	buildNewReleasesParams,
	buildNewSeriesParams,
	CLASSICS_PARAMS,
	HIDDEN_GEMS_PARAMS,
	QUICK_WATCHES_PARAMS,
	TOP_RATED_PARAMS,
	TV_HIDDEN_GEMS_PARAMS,
	TV_POPULAR_PARAMS,
	TV_TOP_RATED_PARAMS,
	withGenre,
} from "./utils/discoverSections";

/** The genre slug used in section URLs for the unfiltered discover page. */
export const ALL_GENRES_SLUG = "all";

interface DiscoverSectionDefinition {
	mediaType: MediaType;
	title: string;
	description: string;
	/** Copy for the genre page. Sections without it only exist unfiltered. */
	genre?: {
		title: string;
		description: (genreName: string) => string;
	};
	fetchPage: (page: number, genre?: DiscoverGenre) => Promise<MediaPage>;
}

// Genre pages list sections in this order, so movies and shows alternate.
const DISCOVER_SECTIONS = {
	popular: {
		mediaType: "movie",
		title: "Popular Movies",
		description: "The movies everyone is talking about",
		fetchPage: (page) => movieList("popular", page),
	},
	trending: {
		mediaType: "movie",
		title: "Trending Movies",
		description: "What everyone is watching this week",
		fetchPage: (page) =>
			getTrendingMedia({
				data: { mediaType: "movie", time_window: "week", page },
			}),
	},
	"trending-tv-shows": {
		mediaType: "tv",
		title: "Trending Series",
		description: "The shows people are bingeing this week",
		fetchPage: (page) =>
			getTrendingMedia({
				data: { mediaType: "tv", time_window: "week", page },
			}),
	},
	"now-in-theaters": {
		mediaType: "movie",
		title: "Now in Theaters",
		description: "Catch these on the big screen",
		fetchPage: (page) => movieList("now_playing", page),
	},
	"new-releases": {
		mediaType: "movie",
		title: "New Releases",
		description: "Well liked movies from the last few months",
		genre: {
			title: "New Releases",
			description: (name) => `${name} movies from the last few months`,
		},
		fetchPage: (page, genre) =>
			discoverMovies(
				narrow(buildNewReleasesParams(new Date()), "movie", genre),
				page,
			),
	},
	"new-series": {
		mediaType: "tv",
		title: "New Series",
		description: "Shows that premiered in the last few months",
		genre: {
			title: "New Series",
			description: (name) => `${name} shows that premiered recently`,
		},
		fetchPage: (page, genre) =>
			discoverTV(narrow(buildNewSeriesParams(new Date()), "tv", genre), page),
	},
	"top-rated": {
		mediaType: "movie",
		title: "Top Rated Movies",
		description: "The highest rated movies on TMDB",
		genre: {
			title: "Top Rated Movies",
			description: (name) => `The highest rated ${name} movies on TMDB`,
		},
		// The unfiltered row uses TMDB's own list, the genre row discover.
		fetchPage: (page, genre) =>
			genre
				? discoverMovies(narrow(TOP_RATED_PARAMS, "movie", genre), page)
				: movieList("top_rated", page),
	},
	"top-rated-tv-shows": {
		mediaType: "tv",
		title: "Top Rated Series",
		description: "The highest rated TV shows on TMDB",
		genre: {
			title: "Top Rated Series",
			description: (name) => `The highest rated ${name} shows on TMDB`,
		},
		fetchPage: (page, genre) =>
			genre
				? discoverTV(narrow(TV_TOP_RATED_PARAMS, "tv", genre), page)
				: tvList("top_rated", page),
	},
	"on-the-air": {
		mediaType: "tv",
		title: "New Episodes This Week",
		description: "Series with episodes airing in the next seven days",
		genre: {
			title: "New Episodes This Week",
			description: (name) => `${name} shows with episodes airing this week`,
		},
		fetchPage: (page, genre) =>
			genre
				? discoverTV(
						narrow(buildAiringThisWeekParams(new Date()), "tv", genre),
						page,
					)
				: tvList("on_the_air", page),
	},
	"coming-soon": {
		mediaType: "movie",
		title: "Coming Soon",
		description: "Upcoming releases to keep an eye on",
		genre: {
			title: "Coming Soon",
			description: (name) => `Upcoming ${name} releases to keep an eye on`,
		},
		fetchPage: (page, genre) =>
			discoverMovies(
				narrow(buildComingSoonParams(new Date()), "movie", genre),
				page,
			),
	},
	"hidden-gems": {
		mediaType: "movie",
		title: "Hidden Gems",
		description: "Great reviews, far fewer viewers",
		genre: {
			title: "Hidden Gems",
			description: () => "Great reviews, far fewer viewers",
		},
		fetchPage: (page, genre) =>
			discoverMovies(narrow(HIDDEN_GEMS_PARAMS, "movie", genre), page),
	},
	"hidden-gem-series": {
		mediaType: "tv",
		title: "Hidden Gem Series",
		description: "Acclaimed shows far fewer people have found",
		genre: {
			title: "Hidden Gem Series",
			description: () => "Acclaimed shows far fewer people have found",
		},
		fetchPage: (page, genre) =>
			discoverTV(narrow(TV_HIDDEN_GEMS_PARAMS, "tv", genre), page),
	},
	"quick-watches": {
		mediaType: "movie",
		title: "Quick Watches",
		description: "Well loved movies under 95 minutes",
		genre: {
			title: "Quick Watches",
			description: () => "Well loved picks under 95 minutes",
		},
		fetchPage: (page, genre) =>
			discoverMovies(narrow(QUICK_WATCHES_PARAMS, "movie", genre), page),
	},
	"popular-tv-shows": {
		mediaType: "tv",
		title: "Popular Series",
		description: "The series everyone is talking about",
		genre: {
			title: "Popular Series",
			description: (name) => `The ${name} shows everyone is watching`,
		},
		fetchPage: (page, genre) =>
			genre
				? discoverTV(narrow(TV_POPULAR_PARAMS, "tv", genre), page)
				: tvList("popular", page),
	},
	"timeless-classics": {
		mediaType: "movie",
		title: "Timeless Classics",
		description: "Acclaimed films from before 1980",
		genre: {
			title: "Timeless Classics",
			description: () => "Acclaimed films from before 1980",
		},
		fetchPage: (page, genre) =>
			discoverMovies(narrow(CLASSICS_PARAMS, "movie", genre), page),
	},
} satisfies Record<string, DiscoverSectionDefinition>;

export type DiscoverSectionSlug = keyof typeof DISCOVER_SECTIONS;

export interface DiscoverSection {
	slug: DiscoverSectionSlug;
	mediaType: MediaType;
	title: string;
	description: string;
	genre?: DiscoverGenre;
}

const movieList = (list: TMDBMovieList, page: number) =>
	getMediaList({ data: { mediaType: "movie", list, page } });

const tvList = (list: TMDBTVList, page: number) =>
	getMediaList({ data: { mediaType: "tv", list, page } });

const discoverMovies = (params: DiscoverMovieParams, page: number) =>
	discoverMedia({ data: { mediaType: "movie", params: { ...params, page } } });

const discoverTV = (params: DiscoverTVParams, page: number) =>
	discoverMedia({ data: { mediaType: "tv", params: { ...params, page } } });

function narrow<T extends DiscoverMovieParams | DiscoverTVParams>(
	params: T,
	mediaType: MediaType,
	genre?: DiscoverGenre,
): T {
	return genre ? withGenre(params, toWithGenres(genre, mediaType)) : params;
}

function isSectionSlug(slug: string): slug is DiscoverSectionSlug {
	return Object.hasOwn(DISCOVER_SECTIONS, slug);
}

/**
 * Looks up a section by its URL slug, with copy for the given genre.
 * Returns undefined when the section doesn't exist for that genre.
 */
export function getDiscoverSection(
	slug: string,
	genre?: DiscoverGenre,
): DiscoverSection | undefined {
	if (!isSectionSlug(slug)) return undefined;
	const definition: DiscoverSectionDefinition = DISCOVER_SECTIONS[slug];

	if (!genre) {
		return {
			slug,
			mediaType: definition.mediaType,
			title: definition.title,
			description: definition.description,
		};
	}
	if (!definition.genre || !hasMediaType(genre, definition.mediaType)) {
		return undefined;
	}

	return {
		slug,
		mediaType: definition.mediaType,
		title: definition.genre.title,
		description: definition.genre.description(genre.name),
		genre,
	};
}

/**
 * All pages of a section. A row shows the first page and the section page
 * keeps loading the rest, so opening "See more" reuses the cached first page.
 */
export const sectionQuery = (
	slug: DiscoverSectionSlug,
	genre?: DiscoverGenre,
) =>
	infiniteQueryOptions({
		queryKey: ["media", "section", { slug, genre: genre?.slug }],
		queryFn: ({ pageParam }) =>
			(DISCOVER_SECTIONS[slug] as DiscoverSectionDefinition).fetchPage(
				pageParam,
				genre,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page >= lastPage.total_pages ? undefined : lastPage.page + 1,
	});

/** Every section that exists for the given genre, in discover page order. */
export function listDiscoverSections(
	genre?: DiscoverGenre,
	mediaType?: MediaType,
): DiscoverSection[] {
	return Object.keys(DISCOVER_SECTIONS).flatMap((slug) => {
		const section = getDiscoverSection(slug, genre);
		return section && (!mediaType || section.mediaType === mediaType)
			? [section]
			: [];
	});
}
