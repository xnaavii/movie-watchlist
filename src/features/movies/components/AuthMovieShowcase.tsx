import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { movieQueries } from "#/features/movies/queries";
import type { ShowcaseMovie } from "#/features/movies/utils/showcase";
import { toMovieSlug } from "#/features/movies/utils/slug";
import { cn } from "#/lib/utils";

const SLIDE_DURATION = 7000;

/**
 * Cycles through trending movies on the auth pages. The stock screenshot
 * stays underneath and shows until the first backdrop has loaded, so a
 * failed or empty fetch leaves the page looking as it did before.
 */
export function AuthMovieShowcase() {
	const { data: movies = [] } = useQuery(movieQueries.authShowcase());
	const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
	const [activeIndex, setActiveIndex] = useState(0);
	// Read inside the timer so late image loads don't restart the countdown.
	const loadedRef = useRef(loaded);
	loadedRef.current = loaded;

	const active = movies[activeIndex];
	const isReady = active !== undefined && loaded.has(active.id);

	useEffect(() => {
		if (!isReady || movies.length < 2) return;

		const timeout = setTimeout(() => {
			// Skip slides whose backdrop is still loading or failed.
			for (let step = 1; step < movies.length; step++) {
				const next = (activeIndex + step) % movies.length;
				if (loadedRef.current.has(movies[next].id)) {
					setActiveIndex(next);
					return;
				}
			}
		}, SLIDE_DURATION);

		return () => clearTimeout(timeout);
	}, [isReady, movies, activeIndex]);

	const markLoaded = (id: number) =>
		setLoaded((current) => new Set(current).add(id));

	return (
		<div className="relative hidden overflow-hidden bg-muted lg:block">
			<img
				src="/discover-desktop.png"
				alt="Showcase of the app"
				className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				loading="lazy"
			/>

			{movies.length > 0 && (
				<div
					className={cn(
						"absolute inset-0 bg-black transition-opacity duration-700",
						isReady ? "opacity-100" : "opacity-0",
					)}
				>
					{movies.map((movie, i) => (
						<img
							key={movie.id}
							src={movie.backdrop}
							alt=""
							aria-hidden
							onLoad={() => markLoaded(movie.id)}
							className={cn(
								"absolute inset-0 size-full object-cover transition-[opacity,scale] ease-out motion-reduce:transition-opacity",
								i === activeIndex
									? "scale-100 opacity-100 duration-[1200ms,8000ms]"
									: "scale-105 opacity-0 duration-[1200ms,0ms] delay-[0ms,1200ms] motion-reduce:scale-100",
							)}
						/>
					))}

					<div className="absolute inset-0 bg-linear-to-t from-black via-black/40 via-45% to-black/10" />

					{active && isReady && (
						<>
							<Link
								to="/movies/$movieSlug"
								params={{ movieSlug: toMovieSlug(active) }}
								className="absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-white"
							>
								<span className="sr-only">View {active.title}</span>
							</Link>
							<ShowcaseDetails key={active.id} movie={active} />
						</>
					)}

					{movies.length > 1 && (
						<div className="absolute inset-x-10 bottom-8 flex gap-1.5 xl:inset-x-14">
							{movies.map((movie, i) => (
								<button
									key={movie.id}
									type="button"
									aria-label={`Show ${movie.title}`}
									disabled={!loaded.has(movie.id)}
									onClick={() => setActiveIndex(i)}
									className="group h-4 flex-1 cursor-pointer disabled:cursor-default"
								>
									<span className="block h-0.5 overflow-hidden rounded-full bg-white/25 transition-colors group-hover:bg-white/40">
										<span
											key={i === activeIndex ? `${movie.id}-active` : movie.id}
											className={cn(
												"block h-full origin-left bg-white",
												i === activeIndex && isReady
													? "animate-showcase-progress"
													: i < activeIndex
														? "scale-x-100"
														: "scale-x-0",
											)}
											style={{ animationDuration: `${SLIDE_DURATION}ms` }}
										/>
									</span>
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function ShowcaseDetails({ movie }: { movie: ShowcaseMovie }) {
	const details = [movie.year !== "N/A" ? movie.year : null, ...movie.genres]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="pointer-events-none absolute inset-x-10 bottom-16 flex flex-col gap-4 text-white xl:inset-x-14">
			<p className="animate-in fade-in text-xs font-medium tracking-widest text-white/60 uppercase duration-700">
				Trending this week
			</p>
			{movie.logo ? (
				<img
					src={movie.logo}
					alt={movie.title}
					className="animate-in fade-in slide-in-from-bottom-3 max-h-32 w-auto max-w-[min(26rem,80%)] self-start object-contain object-left drop-shadow-2xl duration-700"
				/>
			) : (
				<h2 className="animate-in fade-in slide-in-from-bottom-3 text-4xl font-medium tracking-tighter text-balance duration-700 xl:text-5xl">
					{movie.title}
				</h2>
			)}
			<div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-3 text-sm text-white/80 delay-150 duration-700 fill-mode-both">
				{movie.rating !== null && (
					<span className="flex items-center gap-1 font-medium text-white">
						<Star className="size-3.5 fill-current" />
						{movie.rating.toFixed(1)}
					</span>
				)}
				{movie.rating !== null && details && (
					<span className="size-1 rounded-full bg-white/40" />
				)}
				{details && <span>{details}</span>}
			</div>
		</div>
	);
}
