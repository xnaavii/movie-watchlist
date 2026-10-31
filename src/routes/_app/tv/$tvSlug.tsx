import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import {
	MediaDetailsPage,
	MediaDetailsPageNotFound,
	MediaDetailsPagePending,
} from "#/features/media/components/MediaDetailsPage";
import { loadMediaDetails } from "#/features/media/loaders";
import type { MediaDetails } from "#/features/media/types";
import { buildMediaHead } from "#/features/media/utils/meta";
import {
	parseMediaSlug,
	toMediaPath,
	toMediaSlug,
} from "#/features/media/utils/slug";

export const Route = createFileRoute("/_app/tv/$tvSlug")({
	params: {
		priority: 10,
		parse: ({ tvSlug }) => {
			if (parseMediaSlug(tvSlug) === null) throw notFound();
			return { tvSlug };
		},
	},
	loader: async ({ params, context: { queryClient } }) => {
		const id = Number(parseMediaSlug(params.tvSlug));

		let show: MediaDetails;
		try {
			show = await loadMediaDetails(queryClient, { mediaType: "tv", id });
		} catch {
			throw notFound();
		}

		// Send id-only or outdated slugs to the canonical readable URL.
		const canonicalSlug = toMediaSlug(show);
		if (params.tvSlug !== canonicalSlug) {
			throw redirect({
				to: "/tv/$tvSlug",
				params: { tvSlug: canonicalSlug },
				statusCode: 301,
				replace: true,
			});
		}

		return { show };
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return { meta: [{ title: `TV show not found | ${SITE_CONFIG.name}` }] };
		}
		const show = loaderData.show;
		return buildMediaHead(show, `${getSiteUrl()}${toMediaPath(show)}`);
	},
	component: TVShowDetailsPage,
	pendingComponent: MediaDetailsPagePending,
	notFoundComponent: () => <MediaDetailsPageNotFound mediaType="tv" />,
});

function TVShowDetailsPage() {
	const { tvSlug } = Route.useParams();
	const id = Number(parseMediaSlug(tvSlug));

	return <MediaDetailsPage media={{ mediaType: "tv", id }} />;
}
