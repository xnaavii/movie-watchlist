import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AudioLines } from "lucide-react";
import { useState } from "react";
import { BackButtonView } from "#/components/BackButtonView";
import { BrandedTitle } from "#/components/BrandedTitle";
import { Button } from "#/components/ui/button";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import { PickPill } from "#/features/picks/components/PickPill";
import { AtmosTitleCard } from "#/features/sound/components/AtmosTitleCard";
import { soundQueries } from "#/features/sound/queries";
import type { MediaType } from "#/features/sound/types";
import { seo } from "#/utils/seo";

const FILTERS: { value: MediaType | "all"; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "movie", label: "Movies" },
	{ value: "tv", label: "Series" },
];

export const Route = createFileRoute("/_app/discover/atmos")({
	loader: ({ context }) =>
		context.queryClient.query({
			...soundQueries.showcase(),
			staleTime: "static",
		}),
	head: () => ({
		meta: seo({
			title: `Dolby Atmos showcase | ${SITE_CONFIG.name}`,
			description:
				"Movies and series with a Dolby Atmos mix, ranked by how they sound at home. Find something to test your speakers.",
			url: `${getSiteUrl()}/discover/atmos`,
		}),
	}),
	component: AtmosPage,
	pendingComponent: AtmosPagePending,
	errorComponent: AtmosPageError,
});

function AtmosHeader() {
	return (
		<header className="flex flex-col gap-3">
			<BackButtonView fallbackTo="/discover" />
			<BrandedTitle>
				<span className="inline-flex items-center gap-3">
					<AudioLines className="size-7" aria-hidden="true" />
					Dolby Atmos showcase
				</span>
			</BrandedTitle>
			<p className="text-muted-foreground text-pretty max-w-2xl">
				Titles with a Dolby Atmos mix, ranked by how they sound at home. Great
				for testing your speakers. Rate the sound on any movie page to move it
				up the list.
			</p>
		</header>
	);
}

function AtmosPage() {
	const { data: items } = useSuspenseQuery(soundQueries.showcase());
	const [filter, setFilter] = useState<MediaType | "all">("all");

	const visible =
		filter === "all" ? items : items.filter((i) => i.mediaType === filter);

	return (
		<>
			<AtmosHeader />
			<div className="flex flex-wrap gap-2">
				{FILTERS.map((f) => (
					<PickPill
						key={f.value}
						selected={filter === f.value}
						onClick={() => setFilter(f.value)}
					>
						{f.label}
					</PickPill>
				))}
			</div>
			{visible.length === 0 ? (
				<p className="text-muted-foreground">
					Nothing here yet. The list fills in as titles are added and rated.
				</p>
			) : (
				<ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-8">
					{visible.map((item) => (
						<li key={`${item.mediaType}:${item.tmdbId}`}>
							<AtmosTitleCard item={item} />
						</li>
					))}
				</ul>
			)}
		</>
	);
}

function AtmosPagePending() {
	return (
		<>
			<AtmosHeader />
			<ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
				{Array.from({ length: 12 }, (_, i) => (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
						key={i}
						className="aspect-2/3 rounded-3xl bg-muted animate-pulse"
					/>
				))}
			</ul>
		</>
	);
}

function AtmosPageError({ reset }: { reset: () => void }) {
	return (
		<>
			<AtmosHeader />
			<div className="flex flex-col items-start gap-3">
				<p className="text-muted-foreground">
					The Atmos showcase couldn't load right now.
				</p>
				<Button variant="outline" onClick={reset}>
					Try again
				</Button>
			</div>
		</>
	);
}
