import { createFileRoute } from "@tanstack/react-router";
import {
	DiscoverPageError,
	DiscoverPagePending,
} from "#/features/media/components/DiscoverPageStates";
import { DiscoverTypePage } from "#/features/media/components/DiscoverTypePage";
import { loadDiscoverTypePage } from "#/features/media/discoverPages";
import { backdropPreview } from "#/features/media/utils/meta";
import { pageHead, pageTitle } from "#/utils/seo";

export const Route = createFileRoute("/_app/discover/tv-shows")({
	component: DiscoverTVShowsPage,
	pendingComponent: DiscoverPagePending,
	errorComponent: ({ error }) => <DiscoverPageError error={error} />,
	loader: ({ context }) => loadDiscoverTypePage(context.queryClient, "tv"),
	head: ({ loaderData }) =>
		pageHead({
			title: pageTitle("Discover TV shows"),
			description:
				"New episodes this week, fresh premieres and top rated series, or browse by genre.",
			path: "/discover/tv-shows",
			image: backdropPreview(loaderData?.backdrop),
		}),
});

function DiscoverTVShowsPage() {
	return <DiscoverTypePage mediaType="tv" />;
}
