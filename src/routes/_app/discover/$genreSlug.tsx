import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	notFound,
	redirect,
} from "@tanstack/react-router";
import { z } from "zod";
import { BrandedTitle } from "#/components/BrandedTitle";
import { Button } from "#/components/ui/button";
import { MediaGridPagePending } from "#/features/media/components/DiscoverPageStates";
import { GenreDiscoverSections } from "#/features/media/components/GenreDiscoverSections";
import { GenreHero } from "#/features/media/components/GenreHero";
import { MediaRow } from "#/features/media/components/MediaRow";
import { PopularInGenre } from "#/features/media/components/PopularInGenre";
import {
	findDiscoverGenre,
	genreMediaLabel,
	genreMediaTypes,
	genreTagline,
} from "#/features/media/genres";
import { mediaQueries } from "#/features/media/queries";
import { MEDIA_TYPES } from "#/features/media/types";
import { backdropPreview } from "#/features/media/utils/meta";
import { watchlistQueries } from "#/features/watchlist/queries";
import { pageHead, pageTitle } from "#/utils/seo";

const genreSearchSchema = z.object({
	/** Which type the popular grid at the bottom shows. */
	type: z.enum(MEDIA_TYPES).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/discover/$genreSlug")({
	params: {
		priority: 10,
		parse: ({ genreSlug }) => {
			if (!/^[a-z0-9-]+$/i.test(genreSlug)) throw notFound();
			return { genreSlug };
		},
	},
	validateSearch: genreSearchSchema,
	pendingComponent: () => <MediaGridPagePending />,
	beforeLoad: ({ params }) => {
		const genre = findDiscoverGenre(params.genreSlug);
		if (!genre) throw notFound();

		// Send legacy numeric URLs to the readable one.
		if (params.genreSlug !== genre.slug) {
			throw redirect({
				to: "/discover/$genreSlug",
				params: { genreSlug: genre.slug },
				statusCode: 301,
				replace: true,
			});
		}
		return { genre };
	},
	loader: async ({ context }) => {
		const { genre, queryClient } = context;

		const [pages] = await Promise.all([
			Promise.all(
				genreMediaTypes(genre).map((mediaType) =>
					queryClient.infiniteQuery({
						...mediaQueries.popularInGenre(genre, mediaType),
						staleTime: "static",
					}),
				),
			),
			queryClient.query({
				...watchlistQueries.mediaByGenre(genre.slug),
				staleTime: "static",
			}),
			queryClient.query({
				...watchlistQueries.watchlistStatuses(),
				staleTime: "static",
			}),
		]);

		return {
			backdrop: pages[0]?.pages[0]?.results[0]?.backdropPath,
		};
	},
	head: ({ loaderData, params }) => {
		const genre = findDiscoverGenre(params.genreSlug);
		if (!genre) return {};
		return pageHead({
			title: pageTitle(`${genre.name} ${genreMediaLabel(genre)}`),
			description: `${genreTagline(genre)}.`,
			path: `/discover/${genre.slug}`,
			image: backdropPreview(loaderData?.backdrop),
		});
	},
	component: DiscoverGenrePage,
	notFoundComponent: DiscoverGenrePageNotFound,
});

function DiscoverGenrePage() {
	const { genre } = Route.useRouteContext();
	const search = Route.useSearch();
	const mediaTypes = genreMediaTypes(genre);
	const gridType =
		search.type && mediaTypes.includes(search.type)
			? search.type
			: mediaTypes[0];

	// Guests read these from their device, so they run signed out too.
	const { data: watchlistStatuses } = useQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const { data: watchlistItems } = useQuery(
		watchlistQueries.mediaByGenre(genre.slug),
	);

	return (
		<>
			<GenreHero genre={genre} mediaTypes={mediaTypes} />

			{watchlistItems && watchlistItems.length > 0 && (
				<section>
					<MediaRow
						header={
							<div className="flex items-end justify-between gap-4">
								<h2 className="text-xl lg:text-2xl tracking-tighter">
									{genre.name} in Your Watchlist
								</h2>
								<Button variant="link" asChild className="shrink-0 px-0">
									<Link to="/watchlist">See all</Link>
								</Button>
							</div>
						}
						items={watchlistItems}
						watchlistStatuses={watchlistStatuses}
					/>
				</section>
			)}

			<GenreDiscoverSections
				genre={genre}
				watchlistStatuses={watchlistStatuses}
			/>

			<PopularInGenre
				genre={genre}
				mediaType={gridType}
				mediaTypes={mediaTypes}
				watchlistStatuses={watchlistStatuses}
			/>
		</>
	);
}

function DiscoverGenrePageNotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-6 flex-1 h-full">
			<div className="flex flex-col items-center gap-2">
				<BrandedTitle>Oops</BrandedTitle>
				<p className="text-sm lg:text-base text-muted-foreground">
					This genre doesn't exist
				</p>
			</div>
			<Button asChild variant="contrast">
				<Link to="/discover">Back to Discover</Link>
			</Button>
		</div>
	);
}
