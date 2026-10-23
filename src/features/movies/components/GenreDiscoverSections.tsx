import type { WatchlistStatus } from "#/features/watchlist/server/watchlist.server";
import { movieQueries } from "../queries";
import {
	buildComingSoonParams,
	buildNewReleasesParams,
	CLASSICS_PARAMS,
	HIDDEN_GEMS_PARAMS,
	QUICK_WATCHES_PARAMS,
	TOP_RATED_PARAMS,
	withGenre,
} from "../utils/discoverSections";
import { DiscoverMovieSection } from "./DiscoverMovieSection";

interface GenreDiscoverSectionsProps {
	genreId: number;
	genreName?: string;
	watchlistStatuses?: Record<number, WatchlistStatus>;
}

/** The discover page's curated rows, narrowed down to a single genre. */
export function GenreDiscoverSections({
	genreId,
	genreName,
	watchlistStatuses,
}: GenreDiscoverSectionsProps) {
	const today = new Date();

	return (
		<>
			<DiscoverMovieSection
				title="New Releases"
				description={`${genreName} movies from the last few months`}
				query={movieQueries.discover(
					withGenre(buildNewReleasesParams(today), genreId),
				)}
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				title="Coming Soon"
				description={`Upcoming ${genreName} releases to keep an eye on`}
				query={movieQueries.discover(
					withGenre(buildComingSoonParams(today), genreId),
				)}
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				title="Top Rated"
				description={`The highest rated ${genreName} movies on TMDB`}
				query={movieQueries.discover(withGenre(TOP_RATED_PARAMS, genreId))}
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				title="Hidden Gems"
				description="Great reviews, far fewer viewers"
				query={movieQueries.discover(withGenre(HIDDEN_GEMS_PARAMS, genreId))}
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				title="Quick Watches"
				description="Well loved picks under 95 minutes"
				query={movieQueries.discover(withGenre(QUICK_WATCHES_PARAMS, genreId))}
				watchlistStatuses={watchlistStatuses}
			/>
			<DiscoverMovieSection
				title="Timeless Classics"
				description="Acclaimed films from before 1980"
				query={movieQueries.discover(withGenre(CLASSICS_PARAMS, genreId))}
				watchlistStatuses={watchlistStatuses}
			/>
		</>
	);
}
