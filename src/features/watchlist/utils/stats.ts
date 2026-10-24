export type StatsEntry = {
	movieId: number;
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	runtime: number | null;
	voteAverage: number | null;
	status: "want_to_watch" | "watched";
	addedAt: Date;
	watchedAt: Date | null;
};

export type StatsGenreLink = {
	movieId: number;
	genreId: number;
	name: string;
};

export type GenreCount = {
	id: number;
	name: string;
	watched: number;
	saved: number;
};

export type ActivityItem = {
	movieId: number;
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	action: "watched" | "added";
	at: Date;
};

export type ProfileStats = {
	total: number;
	watched: number;
	wantToWatch: number;
	watchedMinutes: number;
	remainingMinutes: number;
	/** Watched movies whose runtime is still unknown, so the total is a floor. */
	watchedMissingRuntime: number;
	averageScore: number | null;
	genres: GenreCount[];
	recent: ActivityItem[];
};

const RECENT_LIMIT = 6;

export function buildProfileStats(
	entries: StatsEntry[],
	genreLinks: StatsGenreLink[],
): ProfileStats {
	const watchedEntries = entries.filter((e) => e.status === "watched");
	const wantEntries = entries.filter((e) => e.status === "want_to_watch");

	const sumRuntime = (list: StatsEntry[]) =>
		list.reduce((total, e) => total + (e.runtime ?? 0), 0);

	const scores = watchedEntries
		.map((e) => e.voteAverage)
		.filter((score): score is number => score != null && score > 0);

	const statusById = new Map(entries.map((e) => [e.movieId, e.status]));
	const genresById = new Map<number, GenreCount>();
	for (const link of genreLinks) {
		const status = statusById.get(link.movieId);
		if (!status) continue;
		const count = genresById.get(link.genreId) ?? {
			id: link.genreId,
			name: link.name,
			watched: 0,
			saved: 0,
		};
		count.saved += 1;
		if (status === "watched") count.watched += 1;
		genresById.set(link.genreId, count);
	}

	const recent: ActivityItem[] = entries
		.map((e) => ({
			movieId: e.movieId,
			title: e.title,
			posterPath: e.posterPath,
			releaseDate: e.releaseDate,
			action:
				e.status === "watched" ? ("watched" as const) : ("added" as const),
			at: e.status === "watched" ? (e.watchedAt ?? e.addedAt) : e.addedAt,
		}))
		.sort((a, b) => b.at.getTime() - a.at.getTime())
		.slice(0, RECENT_LIMIT);

	return {
		total: entries.length,
		watched: watchedEntries.length,
		wantToWatch: wantEntries.length,
		watchedMinutes: sumRuntime(watchedEntries),
		remainingMinutes: sumRuntime(wantEntries),
		watchedMissingRuntime: watchedEntries.filter((e) => e.runtime == null)
			.length,
		averageScore: scores.length
			? scores.reduce((a, b) => a + b, 0) / scores.length
			: null,
		genres: [...genresById.values()].sort(
			(a, b) =>
				b.watched - a.watched ||
				b.saved - a.saved ||
				a.name.localeCompare(b.name),
		),
		recent,
	};
}

/** "2d 4h" for long totals, "5h 12m" for shorter ones. */
export function formatWatchTime(minutes: number): string {
	if (minutes <= 0) return "0h";
	const days = Math.floor(minutes / 1440);
	const hours = Math.floor((minutes % 1440) / 60);
	const mins = minutes % 60;
	if (days > 0) return hours ? `${days}d ${hours}h` : `${days}d`;
	if (hours > 0) return mins ? `${hours}h ${mins}m` : `${hours}h`;
	return `${mins}m`;
}

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 365 * 24 * 3600],
	["month", 30 * 24 * 3600],
	["week", 7 * 24 * 3600],
	["day", 24 * 3600],
	["hour", 3600],
	["minute", 60],
];

export function formatRelativeTime(date: Date, now = new Date()): string {
	const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
	for (const [unit, size] of UNITS) {
		if (Math.abs(seconds) >= size) {
			return relativeFormat.format(Math.round(seconds / size), unit);
		}
	}
	return "just now";
}
