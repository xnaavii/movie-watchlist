import { Link } from "@tanstack/react-router";
import { Bookmark, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { toMovieSlug } from "#/features/movies/utils/slug";
import {
	type ActivityItem,
	formatRelativeTime,
} from "#/features/watchlist/utils/stats";
import { cn } from "#/lib/utils";

interface RecentActivityProps {
	items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Recent activity</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="flex flex-col">
					{items.map((item) => (
						<li key={item.movieId}>
							<Link
								to="/movies/$movieSlug"
								params={{
									movieSlug: toMovieSlug({
										id: item.movieId,
										title: item.title,
									}),
								}}
								className="-mx-2 flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-muted"
							>
								<div className="aspect-2/3 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
									{item.posterPath && (
										<img
											src={item.posterPath}
											alt=""
											className="size-full object-cover"
											loading="lazy"
										/>
									)}
								</div>
								<div className="flex min-w-0 flex-1 flex-col gap-0.5">
									<p className="truncate text-sm font-medium">{item.title}</p>
									<p className="text-xs text-muted-foreground">
										{formatRelativeTime(new Date(item.at))}
									</p>
								</div>
								<ActionPill action={item.action} />
							</Link>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

function ActionPill({ action }: { action: ActivityItem["action"] }) {
	const watched = action === "watched";
	const Icon = watched ? Check : Bookmark;
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
				watched
					? "bg-primary text-primary-foreground"
					: "border border-border text-muted-foreground",
			)}
		>
			<Icon className="size-3" />
			{watched ? "Watched" : "Saved"}
		</span>
	);
}
