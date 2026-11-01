import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { getErrorMessage } from "#/lib/utils";
import { MEDIA_GRID_CLASS } from "./MediaGrid";

const skeletonItems = Array.from({ length: 5 }, (_, i) => ({ id: i }));

export function DiscoverPagePending() {
	return (
		<div className="flex flex-col gap-6 p-4 md:p-10 animate-pulse">
			<div className="h-9 w-72 max-w-full rounded-full bg-muted" />
			<div className="w-full h-[40vh] bg-muted rounded-2xl" />
			<div className="flex gap-2">
				{skeletonItems.map((item) => (
					<div key={item.id} className="h-9 w-24 bg-muted rounded-full" />
				))}
			</div>
			<div className={MEDIA_GRID_CLASS}>
				{skeletonItems.map((item) => (
					<div key={item.id} className="aspect-2/3 bg-muted rounded-lg" />
				))}
			</div>
		</div>
	);
}

const gridItems = Array.from({ length: 12 }, (_, i) => ({ id: i }));

/**
 * The shape of a page that is mostly a grid of posters (genres, sections,
 * search), so the layout doesn't jump when the titles arrive.
 */
export function MediaGridPagePending({
	withSearchField = false,
}: {
	withSearchField?: boolean;
}) {
	return (
		<div
			className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 animate-pulse"
			aria-busy="true"
		>
			<span className="sr-only">Loading</span>
			{withSearchField ? (
				<>
					<div className="flex gap-2">
						<div className="h-9 w-20 rounded-full bg-muted" />
						<div className="h-9 w-24 rounded-full bg-muted" />
					</div>
					<div className="h-12 w-full rounded-full bg-muted" />
				</>
			) : (
				<div className="h-10 w-64 max-w-full rounded-full bg-muted" />
			)}
			<div className={MEDIA_GRID_CLASS}>
				{gridItems.map((item) => (
					<div key={item.id} className="aspect-2/3 bg-muted rounded-lg" />
				))}
			</div>
		</div>
	);
}

export function DiscoverPageError({ error }: { error: unknown }) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-center px-4">
			<h1 className="text-2xl font-medium tracking-tighter">
				Something went wrong
			</h1>
			<p className="text-muted-foreground">{getErrorMessage(error)}</p>
			<Button asChild>
				<Link to="/discover">Try again</Link>
			</Button>
		</div>
	);
}
