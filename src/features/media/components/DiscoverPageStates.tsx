import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { getErrorMessage } from "#/lib/utils";

const skeletonItems = Array.from({ length: 5 }, (_, i) => ({ id: i }));

export function DiscoverPagePending() {
	return (
		<div className="flex flex-col gap-6 p-4 md:p-10 mt-10 md:mt-0 animate-pulse">
			<div className="h-9 w-72 max-w-full rounded-full bg-muted" />
			<div className="w-full h-[40vh] bg-muted rounded-2xl" />
			<div className="flex gap-2">
				{skeletonItems.map((item) => (
					<div key={item.id} className="h-9 w-24 bg-muted rounded-full" />
				))}
			</div>
			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
				{skeletonItems.map((item) => (
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
