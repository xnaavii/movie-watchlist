import type { QueryClient } from "@tanstack/react-query";
import { watchlistQueries } from "#/features/watchlist/queries";
import { mediaQueries } from "./queries";
import type { DiscoverSectionSlug } from "./sections";
import type { MediaListRequest, MediaType } from "./types";

interface DiscoverTypePageConfig {
	/** The page's own route. */
	path: "/discover/movies" | "/discover/tv-shows";
	title: string;
	description: string;
	/** One line on the page's tile on the main discover page. */
	teaser: string;
	/** Feeds the carousel and the ranked row. */
	popular: MediaListRequest;
	popularSection: DiscoverSectionSlug;
	sections: DiscoverSectionSlug[];
}

export const DISCOVER_TYPE_PAGES: Record<MediaType, DiscoverTypePageConfig> = {
	movie: {
		path: "/discover/movies",
		title: "Movies",
		teaser: "In theaters, coming soon and all-time classics",
		description:
			"Big screen premieres, quiet hidden gems and the classics worth revisiting.",
		popular: { mediaType: "movie", list: "popular" },
		popularSection: "popular",
		sections: [
			"trending",
			"now-in-theaters",
			"new-releases",
			"coming-soon",
			"top-rated",
			"hidden-gems",
			"quick-watches",
			"timeless-classics",
		],
	},
	tv: {
		path: "/discover/tv-shows",
		title: "TV Shows",
		teaser: "New episodes this week and series worth a binge",
		description:
			"New episodes this week, fresh premieres and series worth a weekend binge.",
		popular: { mediaType: "tv", list: "popular" },
		popularSection: "popular-tv-shows",
		sections: [
			"trending-tv-shows",
			"on-the-air",
			"new-series",
			"top-rated-tv-shows",
			"hidden-gem-series",
		],
	},
};

/** Loads everything above the fold of a movies or TV discover page. */
export async function loadDiscoverTypePage(
	queryClient: QueryClient,
	mediaType: MediaType,
) {
	const { popular } = DISCOVER_TYPE_PAGES[mediaType];
	const [, , popularPage] = await Promise.all([
		queryClient.query({
			...mediaQueries.genres(mediaType),
			staleTime: "static",
		}),
		queryClient.query({
			...watchlistQueries.watchlistStatuses(),
			staleTime: "static",
		}),
		queryClient.query({ ...mediaQueries.list(popular), staleTime: "static" }),
		queryClient.query({ ...watchlistQueries.list(), staleTime: "static" }),
	]);
	return { backdrop: popularPage.results[0]?.backdropPath };
}
