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

export const Route = createFileRoute("/_app/discover/tv-shows")({
	component: DiscoverTVShowsPage,
	pendingComponent: DiscoverPagePending,
	errorComponent: ({ error }) => <DiscoverPageError error={error} />,
	loader: ({ context }) => loadDiscoverTypePage(context.queryClient, "tv"),
	head: ({ loaderData }) => ({
		meta: seo({
			title: `Discover TV Shows | ${SITE_CONFIG.name}`,
			description:
				"New episodes this week, fresh premieres and top rated series, or browse by genre.",
			image: toTmdbImageUrl(loaderData?.poster, "w500"),
			url: `${getSiteUrl()}/discover/tv-shows`,
		}),
	}),
});

function DiscoverTVShowsPage() {
	return <DiscoverTypePage mediaType="tv" />;
}
