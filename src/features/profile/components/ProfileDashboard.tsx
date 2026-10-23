import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, Eye, Star } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "#/components/ui/empty";
import {
	formatWatchTime,
	type ProfileStats,
} from "#/features/watchlist/utils/stats";
import { GenreChart } from "./GenreChart";
import { RecentActivity } from "./RecentActivity";
import { StatTile } from "./StatTile";
import { WatchProgress } from "./WatchProgress";

interface ProfileDashboardProps {
	stats: ProfileStats;
}

export function ProfileDashboard({ stats }: ProfileDashboardProps) {
	if (stats.total === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyTitle>Your stats start with your first movie</EmptyTitle>
					<EmptyDescription>
						Save movies to your watchlist and mark them as watched to see your
						top genres, watch time and more.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="contrast" asChild>
						<Link to="/discover">Discover movies</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-4 lg:gap-6">
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
				<StatTile
					icon={Eye}
					label="Watched"
					value={stats.watched}
					detail={`of ${stats.total} saved`}
				/>
				<StatTile
					icon={Clock}
					label="Watch time"
					value={formatWatchTime(stats.watchedMinutes)}
					detail={
						stats.watchedMissingRuntime > 0
							? `${stats.watchedMissingRuntime} still loading`
							: "across watched movies"
					}
				/>
				<StatTile
					icon={Star}
					label="Avg. score"
					value={stats.averageScore ? stats.averageScore.toFixed(1) : "–"}
					detail="TMDB score of watched"
				/>
				<StatTile
					icon={Bookmark}
					label="To watch"
					value={stats.wantToWatch}
					detail={
						stats.remainingMinutes > 0
							? `${formatWatchTime(stats.remainingMinutes)} to go`
							: "on your watchlist"
					}
				/>
			</div>
			<div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
				<div className="flex flex-col gap-4 lg:col-span-3 lg:gap-6">
					<GenreChart genres={stats.genres} hasWatched={stats.watched > 0} />
					<WatchProgress
						watched={stats.watched}
						wantToWatch={stats.wantToWatch}
					/>
				</div>
				<div className="lg:col-span-2">
					<RecentActivity items={stats.recent} />
				</div>
			</div>
		</div>
	);
}
