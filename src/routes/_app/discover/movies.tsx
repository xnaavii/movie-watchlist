import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import {
	DiscoverPageError,
	DiscoverPagePending,
} from "#/features/media/components/DiscoverPageStates";
import { DiscoverTypePage } from "#/features/media/components/DiscoverTypePage";
import { loadDiscoverTypePage } from "#/features/media/discoverPages";
import { toTmdbImageUrl } from "#/features/media/utils/tmdb";
import { seo } from "#/utils/seo";

export const Route = createFileRoute("/_app/discover/movies")({
	component: DiscoverMoviesPage,
	pendingComponent: DiscoverPagePending,
	errorComponent: ({ error }) => <DiscoverPageError error={error} />,
	loader: ({ context }) => loadDiscoverTypePage(context.queryClient, "movie"),
	head: ({ loaderData }) => ({
		meta: seo({
			title: `Discover Movies | ${SITE_CONFIG.name}`,
			description:
				"Trending, new, top rated and hidden gem movies, or browse by genre.",
			image: toTmdbImageUrl(loaderData?.poster, "w500"),
			url: `${getSiteUrl()}/discover/movies`,
		}),
	}),
});

function DiscoverMoviesPage() {
	return <DiscoverTypePage mediaType="movie" />;
}
