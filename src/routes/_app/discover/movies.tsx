import { createFileRoute } from "@tanstack/react-router";
import {
	DiscoverPageError,
	DiscoverPagePending,
} from "#/features/media/components/DiscoverPageStates";
import { DiscoverTypePage } from "#/features/media/components/DiscoverTypePage";
import { loadDiscoverTypePage } from "#/features/media/discoverPages";
import { backdropPreview } from "#/features/media/utils/meta";
import { pageHead, pageTitle } from "#/utils/seo";

export const Route = createFileRoute("/_app/discover/movies")({
	component: DiscoverMoviesPage,
	pendingComponent: DiscoverPagePending,
	errorComponent: ({ error }) => <DiscoverPageError error={error} />,
	loader: ({ context }) => loadDiscoverTypePage(context.queryClient, "movie"),
	head: ({ loaderData }) =>
		pageHead({
			title: pageTitle("Discover movies"),
			description:
				"Trending, new, top rated and hidden gem movies, or browse by genre.",
			path: "/discover/movies",
			image: backdropPreview(loaderData?.backdrop),
		}),
});

function DiscoverMoviesPage() {
	return <DiscoverTypePage mediaType="movie" />;
}
