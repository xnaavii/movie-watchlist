import type { DiscoverMovieParams } from "@lorenzopant/tmdb";
import { infiniteQueryOptions } from "@tanstack/react-query";
import {
	discoverMedia,
	getMediaList,
	getTrendingMedia,
} from "./server/media.functions";
import type { MediaPage, MediaType, TMDBMovieList, TMDBTVList } from "./types";
import {
	buildComingSoonParams,
	buildNewReleasesParams,
	CLASSICS_PARAMS,
	HIDDEN_GEMS_PARAMS,
	QUICK_WATCHES_PARAMS,
	TOP_RATED_PARAMS,
	withGenre,
} from "./utils/discoverSections";

/** The genre a section is narrowed down to, if any. */
export type SectionGenre = { id: number; name: string };

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
	fetchPage: (page: number, genreId?: number) => Promise<MediaPage>;
}

const DISCOVER_SECTIONS = {
	popular: {
		mediaType: "movie",
		title: "Popular Movies",
		description: "The movies everyone is talking about",
		fetchPage: (page) => movieList("popular", page),
	},
	trending: {
		mediaType: "movie",
		title: "Trending This Week",
		description: "What everyone is watching right now",
		fetchPage: (page) =>
			getTrendingMedia({
				data: { mediaType: "movie", time_window: "week", page },
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
		fetchPage: (page, genreId) =>
			discoverMovies({
				...narrow(buildNewReleasesParams(new Date()), genreId),
				page,
			}),
	},
	"coming-soon": {
		mediaType: "movie",
		title: "Coming Soon",
		description: "Upcoming releases to keep an eye on",
		genre: {
			title: "Coming Soon",
			description: (name) => `Upcoming ${name} releases to keep an eye on`,
		},
		fetchPage: (page, genreId) =>
			discoverMovies({
				...narrow(buildComingSoonParams(new Date()), genreId),
				page,
			}),
	},
	"top-rated": {
		mediaType: "movie",
		title: "Top Rated of All Time",
		description: "The highest rated movies on TMDB",
		genre: {
			title: "Top Rated",
			description: (name) => `The highest rated ${name} movies on TMDB`,
		},
		// The unfiltered row uses TMDB's own list, the genre row discover.
		fetchPage: (page, genreId) =>
			genreId === undefined
				? movieList("top_rated", page)
				: discoverMovies({ ...withGenre(TOP_RATED_PARAMS, genreId), page }),
	},
	"hidden-gems": {
		mediaType: "movie",
		title: "Hidden Gems",
		description: "Great reviews, far fewer viewers",
		genre: {
			title: "Hidden Gems",
			description: () => "Great reviews, far fewer viewers",
		},
		fetchPage: (page, genreId) =>
			discoverMovies({ ...narrow(HIDDEN_GEMS_PARAMS, genreId), page }),
	},
	"quick-watches": {
		mediaType: "movie",
		title: "Quick Watches",
		description: "Well loved movies under 95 minutes",
		genre: {
			title: "Quick Watches",
			description: () => "Well loved picks under 95 minutes",
		},
		fetchPage: (page, genreId) =>
			discoverMovies({ ...narrow(QUICK_WATCHES_PARAMS, genreId), page }),
	},
	"timeless-classics": {
		mediaType: "movie",
		title: "Timeless Classics",
		description: "Acclaimed films from before 1980",
		genre: {
			title: "Timeless Classics",
			description: () => "Acclaimed films from before 1980",
		},
		fetchPage: (page, genreId) =>
			discoverMovies({ ...narrow(CLASSICS_PARAMS, genreId), page }),
	},
	"popular-tv-shows": {
		mediaType: "tv",
		title: "Popular TV Shows",
		description: "The series everyone is talking about",
		fetchPage: (page) => tvList("popular", page),
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
	"on-the-air": {
		mediaType: "tv",
		title: "New Episodes This Week",
		description: "Series with episodes airing in the next seven days",
		fetchPage: (page) => tvList("on_the_air", page),
	},
	"top-rated-tv-shows": {
		mediaType: "tv",
		title: "Top Rated Series",
		description: "The highest rated TV shows on TMDB",
		fetchPage: (page) => tvList("top_rated", page),
	},
} satisfies Record<string, DiscoverSectionDefinition>;

export type DiscoverSectionSlug = keyof typeof DISCOVER_SECTIONS;

export interface DiscoverSection {
	slug: DiscoverSectionSlug;
	mediaType: MediaType;
	title: string;
	description: string;
	genre?: SectionGenre;
}

const movieList = (list: TMDBMovieList, page: number) =>
	getMediaList({ data: { mediaType: "movie", list, page } });

const tvList = (list: TMDBTVList, page: number) =>
	getMediaList({ data: { mediaType: "tv", list, page } });

const discoverMovies = (params: DiscoverMovieParams) =>
	discoverMedia({ data: { mediaType: "movie", params } });

function narrow<T extends object>(params: T, genreId?: number) {
	return genreId === undefined ? params : withGenre(params, genreId);
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
	genre?: SectionGenre,
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
	if (!definition.genre) return undefined;

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
export const sectionQuery = (slug: DiscoverSectionSlug, genreId?: number) =>
	infiniteQueryOptions({
		queryKey: ["media", "section", { slug, genreId }],
		queryFn: ({ pageParam }) =>
			(DISCOVER_SECTIONS[slug] as DiscoverSectionDefinition).fetchPage(
				pageParam,
				genreId,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page >= lastPage.total_pages ? undefined : lastPage.page + 1,
	});

/** Every section that exists for the given genre, in discover page order. */
export function listDiscoverSections(
	genre?: SectionGenre,
	mediaType?: MediaType,
): DiscoverSection[] {
	return Object.keys(DISCOVER_SECTIONS).flatMap((slug) => {
		const section = getDiscoverSection(slug, genre);
		return section && (!mediaType || section.mediaType === mediaType)
			? [section]
			: [];
	});
}
