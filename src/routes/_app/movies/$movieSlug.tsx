import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import {
	MediaDetailsPage,
	MediaDetailsPageNotFound,
	MediaDetailsPagePending,
} from "#/features/media/components/MediaDetailsPage";
import { loadMediaDetails } from "#/features/media/loaders";
import type { MediaDetails } from "#/features/media/types";
import { buildMediaHead } from "#/features/media/utils/meta";
import { parseMediaSlug, toMediaSlug } from "#/features/media/utils/slug";
import { pageTitle } from "#/utils/seo";

export const Route = createFileRoute("/_app/movies/$movieSlug")({
	params: {
		priority: 10,
		parse: ({ movieSlug }) => {
			if (parseMediaSlug(movieSlug) === null) throw notFound();
			return { movieSlug };
		},
	},
	loader: async ({ params, context: { queryClient } }) => {
		const id = Number(parseMediaSlug(params.movieSlug));

		let movie: MediaDetails;
		try {
			movie = await loadMediaDetails(queryClient, { mediaType: "movie", id });
		} catch {
			throw notFound();
		}

		// Send id-only or outdated slugs to the canonical readable URL.
		const canonicalSlug = toMediaSlug(movie);
		if (params.movieSlug !== canonicalSlug) {
			throw redirect({
				to: "/movies/$movieSlug",
				params: { movieSlug: canonicalSlug },
				statusCode: 301,
				replace: true,
			});
		}

		return { movie };
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [
					{ title: pageTitle("Movie not found") },
					{ name: "robots", content: "noindex" },
				],
			};
		}
		return buildMediaHead(loaderData.movie);
	},
	component: MovieDetailsPage,
	pendingComponent: MediaDetailsPagePending,
	notFoundComponent: () => <MediaDetailsPageNotFound mediaType="movie" />,
});

function MovieDetailsPage() {
	const { movieSlug } = Route.useParams();
	const id = Number(parseMediaSlug(movieSlug));

	return <MediaDetailsPage media={{ mediaType: "movie", id }} />;
}
