import {
	type QueryClient,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { BackButtonView } from "#/components/BackButtonView";
import { BrandedTitle } from "#/components/BrandedTitle";
import { InfiniteScrollFooter } from "#/components/InfiniteScrollFooter";
import { Button } from "#/components/ui/button";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import { MovieGrid } from "#/features/movies/components/MovieGrid";
import { movieQueries } from "#/features/movies/queries";
import {
	ALL_GENRES_SLUG,
	type DiscoverSection,
	getDiscoverSection,
	listDiscoverSections,
	type SectionGenre,
	sectionQuery,
} from "#/features/movies/sections";
import { normalizeMovie } from "#/features/movies/utils";
import { findGenreBySlug, toGenreSlug } from "#/features/movies/utils/slug";
import { watchlistQueries } from "#/features/watchlist/queries";
import { useInfiniteScrollTrigger } from "#/hooks/useInfiniteScrollTrigger";
import { cn } from "#/lib/utils";
import { seo } from "#/utils/seo";

export const Route = createFileRoute("/_app/discover/$genreSlug_/$section")({
	loader: async ({ context, params }) => {
		const genre = await resolveGenre(context.queryClient, params.genreSlug);
		const section = getDiscoverSection(params.section, genre);
		if (!section) throw notFound();

		const [movies] = await Promise.all([
			context.queryClient.ensureInfiniteQueryData(
				sectionQuery(section.slug, genre?.id),
			),
			context.queryClient.ensureQueryData(watchlistQueries.watchlistStatuses()),
		]);

		return { section, poster: movies.pages[0]?.results[0]?.poster_path };
	},
	head: ({ loaderData, params }) => {
		if (!loaderData) return {};
		const { section, poster } = loaderData;
		const name = section.genre
			? `${section.genre.name} ${section.title}`
			: section.title;

		return {
			meta: seo({
				title: `${name} | ${SITE_CONFIG.name}`,
				description: section.description,
				image: poster ? `https://image.tmdb.org/t/p/w500${poster}` : undefined,
				url: `${getSiteUrl()}/discover/${params.genreSlug}/${params.section}`,
			}),
		};
	},
	component: DiscoverSectionPage,
	notFoundComponent: DiscoverSectionNotFound,
});

async function resolveGenre(
	queryClient: QueryClient,
	genreSlug: string,
): Promise<SectionGenre | undefined> {
	if (genreSlug === ALL_GENRES_SLUG) return undefined;

	const { genres } = await queryClient.ensureQueryData(movieQueries.genres({}));
	const genre = findGenreBySlug(genres, genreSlug);
	if (!genre) throw notFound();

	return { id: genre.id, name: genre.name };
}

function DiscoverSectionPage() {
	const { section } = Route.useLoaderData();
	const { genre } = section;

	const { data: watchlistStatuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const {
		data: moviePages,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
	} = useSuspenseInfiniteQuery(sectionQuery(section.slug, genre?.id));

	// TMDB pages can overlap as rankings shift, so drop repeats.
	const movies = useMemo(() => {
		const byId = new Map<number, ReturnType<typeof normalizeMovie>>();
		for (const page of moviePages.pages) {
			for (const movie of page.results) {
				if (!byId.has(movie.id)) byId.set(movie.id, normalizeMovie(movie));
			}
		}
		return [...byId.values()];
	}, [moviePages]);

	const sentinelRef = useInfiniteScrollTrigger({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		itemCount: movies.length,
		disabled: isFetchNextPageError,
	});

	const genreSlug = genre ? toGenreSlug(genre) : ALL_GENRES_SLUG;

	return (
		<>
			<header className="flex flex-col gap-6">
				<BackButtonView
					fallbackTo={genre ? `/discover/${genreSlug}` : "/discover"}
				/>
				<div className="flex flex-col gap-2">
					{genre && (
						<Link
							to="/discover/$genreSlug"
							params={{ genreSlug }}
							className="w-fit text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							{genre.name}
						</Link>
					)}
					<BrandedTitle>{section.title}</BrandedTitle>
					<p className="text-sm lg:text-base text-muted-foreground text-pretty">
						{section.description}
					</p>
				</div>
				<SectionSwitcher
					sections={listDiscoverSections(genre)}
					active={section.slug}
					genreSlug={genreSlug}
				/>
			</header>

			<section className="flex flex-col gap-4" aria-label={section.title}>
				<MovieGrid movies={movies} watchlistStatuses={watchlistStatuses} />
				<InfiniteScrollFooter
					ref={sentinelRef}
					isFetchingNextPage={isFetchingNextPage}
					isError={isFetchNextPageError}
					onRetry={() => fetchNextPage()}
				/>
				{!hasNextPage && movies.length > 0 && (
					<p className="text-center text-sm text-muted-foreground">
						That&apos;s everything in {section.title}.
					</p>
				)}
			</section>
		</>
	);
}

interface SectionSwitcherProps {
	sections: DiscoverSection[];
	active: DiscoverSection["slug"];
	genreSlug: string;
}

/** Jumps between sibling sections without going back to the discover page. */
function SectionSwitcher({
	sections,
	active,
	genreSlug,
}: SectionSwitcherProps) {
	return (
		<nav aria-label="More sections" className="-mx-4 overflow-x-auto px-4">
			<ul className="flex w-max gap-2">
				{sections.map((section) => {
					const isActive = section.slug === active;
					return (
						<li key={section.slug}>
							<Button
								asChild
								size="sm"
								variant={isActive ? "default" : "secondary"}
								className={cn(isActive && "pointer-events-none")}
							>
								<Link
									to="/discover/$genreSlug/$section"
									params={{ genreSlug, section: section.slug }}
									aria-current={isActive ? "page" : undefined}
									replace
								>
									{section.title}
								</Link>
							</Button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

function DiscoverSectionNotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-6 flex-1 h-full">
			<div className="flex flex-col items-center gap-2">
				<BrandedTitle>Oops</BrandedTitle>
				<p className="text-sm lg:text-base text-muted-foreground">
					This list doesn't exist
				</p>
			</div>
			<Button asChild variant="contrast">
				<Link to="/discover">Back to Discover</Link>
			</Button>
		</div>
	);
}
