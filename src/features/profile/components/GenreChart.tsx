import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	Bar,
	BarChart,
	LabelList,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { findDiscoverGenreById } from "#/features/media/genres";
import type { GenreCount } from "#/features/watchlist/utils/stats";
import { cn } from "#/lib/utils";

const MAX_GENRES = 8;
const ROW_HEIGHT = 36;

type Scope = "watched" | "saved";

const SCOPES: { value: Scope; label: string }[] = [
	{ value: "watched", label: "Watched" },
	{ value: "saved", label: "All saved" },
];

interface GenreChartProps {
	genres: GenreCount[];
	hasWatched: boolean;
}

export function GenreChart({ genres, hasWatched }: GenreChartProps) {
	const [scope, setScope] = useState<Scope>(hasWatched ? "watched" : "saved");
	const navigate = useNavigate();

	const data = genres
		.map((genre) => ({ ...genre, count: genre[scope] }))
		.filter((genre) => genre.count > 0)
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
		.slice(0, MAX_GENRES);

	return (
		<Card>
			<CardHeader className="flex flex-col gap-3 sm:gap-1.5">
				<div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="flex flex-col gap-1.5">
						<CardTitle>Most watched genres</CardTitle>
						<CardDescription>
							{scope === "watched"
								? "Movies you've marked as watched"
								: "Everything on your watchlist"}
						</CardDescription>
					</div>
					<CardAction className="static col-start-auto row-span-auto self-start justify-self-start sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:self-start sm:justify-self-end">
						<div className="flex gap-1 rounded-full bg-muted p-1">
							{SCOPES.map(({ value, label }) => (
								<button
									key={value}
									type="button"
									aria-pressed={scope === value}
									onClick={() => setScope(value)}
									className={cn(
										"rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium transition-colors",
										scope === value
											? "bg-foreground text-background"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{label}
								</button>
							))}
						</div>
					</CardAction>
				</div>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						Mark a movie as watched to see your top genres.
					</p>
				) : (
					<>
						<ResponsiveContainer
							width="100%"
							height={data.length * ROW_HEIGHT + 8}
						>
							<BarChart
								data={data}
								layout="vertical"
								margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
								barCategoryGap={8}
								accessibilityLayer
							>
								<XAxis type="number" hide allowDecimals={false} />
								<YAxis
									type="category"
									dataKey="name"
									width={100}
									tickLine={false}
									axisLine={false}
									tick={{ fill: "var(--foreground)", fontSize: 12 }}
									className="sm:[&_.recharts-text]:text-[13px]"
								/>
								<Tooltip
									cursor={{ fill: "var(--muted)", radius: 8 }}
									content={({ active, payload }) => {
										const genre = payload?.[0]?.payload as
											| (GenreCount & { count: number })
											| undefined;
										if (!active || !genre) return null;
										return (
											<div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-md">
												<p className="font-medium">{genre.name}</p>
												<p className="text-muted-foreground tabular-nums">
													{genre.watched} watched · {genre.saved} saved
												</p>
											</div>
										);
									}}
								/>
								<Bar
									dataKey="count"
									fill="var(--foreground)"
									fillOpacity={0.85}
									radius={[0, 4, 4, 0]}
									maxBarSize={20}
									className="cursor-pointer"
									onClick={(entry) => {
										const { id } = entry.payload as GenreCount;
										const genre = findDiscoverGenreById(id);
										if (!genre) return;
										navigate({
											to: "/discover/$genreSlug",
											params: { genreSlug: genre.slug },
										});
									}}
								>
									<LabelList
										dataKey="count"
										position="right"
										offset={8}
										className="fill-muted-foreground tabular-nums"
										fontSize={12}
									/>
								</Bar>
							</BarChart>
						</ResponsiveContainer>
						<table className="sr-only">
							<caption>Movies per genre</caption>
							<thead>
								<tr>
									<th>Genre</th>
									<th>Watched</th>
									<th>Saved</th>
								</tr>
							</thead>
							<tbody>
								{data.map((genre) => (
									<tr key={genre.id}>
										<td>{genre.name}</td>
										<td>{genre.watched}</td>
										<td>{genre.saved}</td>
									</tr>
								))}
							</tbody>
						</table>
					</>
				)}
			</CardContent>
		</Card>
	);
}
