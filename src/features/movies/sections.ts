import type { MovieResultItem, PaginatedResponse } from "@lorenzopant/tmdb";
import { infiniteQueryOptions } from "@tanstack/react-query";
import {
	discoverMovies,
	getMovieList,
	getTrendingMovies,
} from "./server/movies.functions";
import {
	buildComingSoonParams,
	buildNewReleasesParams,
	CLASSICS_PARAMS,
	HIDDEN_GEMS_PARAMS,
	QUICK_WATCHES_PARAMS,
	TOP_RATED_PARAMS,
	withGenre,
} from "./utils/discoverSections";

type MoviePage = PaginatedResponse<MovieResultItem>;

/** The genre a section is narrowed down to, if any. */
export type SectionGenre = { id: number; name: string };

/** The genre slug used in section URLs for the unfiltered discover page. */
export const ALL_GENRES_SLUG = "all";

interface DiscoverSectionDefinition {
	title: string;
	description: string;
	/** Copy for the genre page. Sections without it only exist unfiltered. */
	genre?: {
		title: string;
		description: (genreName: string) => string;
	};
	fetchPage: (page: number, genreId?: number) => Promise<MoviePage>;
}

const DISCOVER_SECTIONS = {
	popular: {
		title: "Popular Movies",
		description: "The movies everyone is talking about",
		fetchPage: (page) => getMovieList({ data: { list: "popular", page } }),
	},
	trending: {
		title: "Trending This Week",
		description: "What everyone is watching right now",
		fetchPage: (page) =>
			getTrendingMovies({ data: { time_window: "week", page } }),
	},
	"now-in-theaters": {
		title: "Now in Theaters",
		description: "Catch these on the big screen",
		fetchPage: (page) => getMovieList({ data: { list: "now_playing", page } }),
	},
	"new-releases": {
		title: "New Releases",
		description: "Well liked movies from the last few months",
		genre: {
			title: "New Releases",
			description: (name) => `${name} movies from the last few months`,
		},
		fetchPage: (page, genreId) =>
			discoverMovies({
				data: { ...narrow(buildNewReleasesParams(new Date()), genreId), page },
			}),
	},
	"coming-soon": {
		title: "Coming Soon",
		description: "Upcoming releases to keep an eye on",
		genre: {
			title: "Coming Soon",
			description: (name) => `Upcoming ${name} releases to keep an eye on`,
		},
		fetchPage: (page, genreId) =>
			discoverMovies({
				data: { ...narrow(buildComingSoonParams(new Date()), genreId), page },
			}),
	},
	"top-rated": {
		title: "Top Rated of All Time",
		description: "The highest rated movies on TMDB",
		genre: {
			title: "Top Rated",
			description: (name) => `The highest rated ${name} movies on TMDB`,
		},
		// The unfiltered row uses TMDB's own list, the genre row discover.
		fetchPage: (page, genreId) =>
			genreId === undefined
				? getMovieList({ data: { list: "top_rated", page } })
				: discoverMovies({
						data: { ...withGenre(TOP_RATED_PARAMS, genreId), page },
					}),
	},
	"hidden-gems": {
		title: "Hidden Gems",
		description: "Great reviews, far fewer viewers",
		genre: {
			title: "Hidden Gems",
			description: () => "Great reviews, far fewer viewers",
		},
		fetchPage: (page, genreId) =>
			discoverMovies({
				data: { ...narrow(HIDDEN_GEMS_PARAMS, genreId), page },
			}),
	},
	"quick-watches": {
		title: "Quick Watches",
		description: "Well loved movies under 95 minutes",
		genre: {
			title: "Quick Watches",
			description: () => "Well loved picks under 95 minutes",
		},
		fetchPage: (page, genreId) =>
			discoverMovies({
				data: { ...narrow(QUICK_WATCHES_PARAMS, genreId), page },
			}),
	},
	"timeless-classics": {
		title: "Timeless Classics",
		description: "Acclaimed films from before 1980",
		genre: {
			title: "Timeless Classics",
			description: () => "Acclaimed films from before 1980",
		},
		fetchPage: (page, genreId) =>
			discoverMovies({ data: { ...narrow(CLASSICS_PARAMS, genreId), page } }),
	},
} satisfies Record<string, DiscoverSectionDefinition>;

export type DiscoverSectionSlug = keyof typeof DISCOVER_SECTIONS;

export interface DiscoverSection {
	slug: DiscoverSectionSlug;
	title: string;
	description: string;
	genre?: SectionGenre;
}

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
			title: definition.title,
			description: definition.description,
		};
	}
	if (!definition.genre) return undefined;

	return {
		slug,
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
		queryKey: ["movies", "section", { slug, genreId }],
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
export function listDiscoverSections(genre?: SectionGenre): DiscoverSection[] {
	return Object.keys(DISCOVER_SECTIONS).flatMap((slug) => {
		const section = getDiscoverSection(slug, genre);
		return section ? [section] : [];
	});
}
