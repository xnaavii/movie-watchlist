import { useSuspenseQuery } from "@tanstack/react-query";
import { BrandedTitle } from "#/components/BrandedTitle";
import { WatchlistRowView } from "#/features/watchlist/components/WatchlistRowView";
import { watchlistQueries } from "#/features/watchlist/queries";
import { DISCOVER_TYPE_PAGES } from "../discoverPages";
import { listDiscoverGenres } from "../genres";
import { useMediaLogos } from "../hooks/useMediaLogos";
import { mediaQueries } from "../queries";
import { getDiscoverSection } from "../sections";
import type { MediaType } from "../types";
import { DiscoverMediaSection } from "./DiscoverMediaSection";
import { DiscoverNav } from "./DiscoverNav";
import { FeaturedMediaCarousel } from "./FeaturedMediaCarousel";
import { GenreRow } from "./GenreRow";
import { MediaRow } from "./MediaRow";
import { SectionHeader } from "./SectionHeader";

interface DiscoverTypePageProps {
	mediaType: MediaType;
}

/** The movies or TV discover page: one media type, every curated row. */
export function DiscoverTypePage({ mediaType }: DiscoverTypePageProps) {
	const page = DISCOVER_TYPE_PAGES[mediaType];
	const { data: watchlistStatuses } = useSuspenseQuery(
		watchlistQueries.watchlistStatuses(),
	);
	const { data: genres } = useSuspenseQuery(mediaQueries.genres(mediaType));
	const { data: popular } = useSuspenseQuery(mediaQueries.list(page.popular));
	const logos = useMediaLogos(popular.results);
	const popularSection = getDiscoverSection(page.popularSection);
	const [firstSection, ...otherSections] = page.sections;

	return (
		<>
			<header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div className="flex flex-col gap-2">
					<BrandedTitle>{page.title}</BrandedTitle>
					<p className="text-sm lg:text-base text-muted-foreground text-pretty">
						{page.description}
					</p>
				</div>
				<DiscoverNav current={mediaType} />
			</header>
			<FeaturedMediaCarousel
				items={popular.results}
				genres={genres.genres}
				watchlistStatuses={watchlistStatuses}
				logos={logos}
			/>
			<section className="flex flex-col gap-4">
				<h2 className="text-xl lg:text-2xl tracking-tighter">
					Browse by genre
				</h2>
				<GenreRow genres={listDiscoverGenres(mediaType)} />
			</section>
			{popularSection && (
				<section className="flex flex-col gap-4">
					<SectionHeader
						title={popularSection.title}
						description={popularSection.description}
						section={popularSection.slug}
					/>
					<MediaRow
						items={popular.results}
						logos={logos}
						watchlistStatuses={watchlistStatuses}
						variant="backdrop"
						showRanks
					/>
				</section>
			)}
			<DiscoverMediaSection
				section={firstSection}
				watchlistStatuses={watchlistStatuses}
			/>
			<WatchlistRowView mediaType={mediaType} />
			{otherSections.map((section) => (
				<DiscoverMediaSection
					key={section}
					section={section}
					watchlistStatuses={watchlistStatuses}
				/>
			))}
		</>
	);
}
