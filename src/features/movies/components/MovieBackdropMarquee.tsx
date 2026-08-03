import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Marquee } from "#/components/shadcn-space/animations/marquee";
import type { Movie } from "#/features/watchlist/server/watchlist.server";

interface MovieBackdropMarquee {
	movies: Movie[];
	children?: ReactNode;
}

export function MovieBackdropMarquee({ movies }: MovieBackdropMarquee) {
	const firstRow = movies.slice(0, movies.length / 2);
	const secondRow = movies.slice(movies.length / 2);

	return (
		<div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
			<Marquee pauseOnHover className="[--duration:100s]">
				{firstRow.map((movie) => (
					<Link
						to={"/movies/$id"}
						params={{ id: `${movie.id}` }}
						key={movie.id}
						title={movie.title}
						className="group/card"
					>
						<div className="relative h-full w-48 md:w-64 cursor-pointer overflow-hidden border-border bg-card shadow-none">
							{movie.backdropPath ? (
								<img
									src={movie.backdropPath}
									alt={`${movie.title}'s backdrop`}
									className="h-full w-full object-cover rounded-md"
								/>
							) : movie.posterPath ? (
								<img
									src={movie.posterPath}
									alt={`${movie.title}'s backdrop`}
									className="w-full object-cover rounded-md aspect-video object-top"
								/>
							) : (
								<div className="bg-primary/40 aspect-video rounded-md flex items-center justify-center">
									<p className="text-xs font-medium">{movie.title}</p>
								</div>
							)}
							<div className="absolute bottom-0 left-0 p-2 w-full translate-y-full bg-linear-to-t from-background to-transparent group-hover/card:translate-y-0">
								<p className="text-xs font-medium">{movie.title}</p>
							</div>
						</div>
					</Link>
				))}
			</Marquee>
			<Marquee reverse pauseOnHover className="[--duration:100s]">
				{secondRow.map((movie) => (
					<Link
						to={"/movies/$id"}
						params={{ id: `${movie.id}` }}
						key={movie.id}
						title={movie.title}
						className="group/card"
					>
						<div className="relative h-full w-48 md:w-64 cursor-pointer overflow-hidden border-border bg-card shadow-none">
							{movie.backdropPath ? (
								<img
									src={movie.backdropPath}
									alt={`${movie.title}'s backdrop`}
									className="h-full w-full object-cover rounded-md"
								/>
							) : movie.posterPath ? (
								<img
									src={movie.posterPath}
									alt={`${movie.title}'s backdrop`}
									className="w-full object-cover rounded-md aspect-video object-top"
								/>
							) : (
								<div className="bg-primary/40 aspect-video rounded-md flex items-center justify-center">
									<p className="text-xs font-medium">{movie.title}</p>
								</div>
							)}
							<div className="absolute bottom-0 left-0 p-2 w-full translate-y-full bg-linear-to-t from-background to-transparent group-hover/card:translate-y-0">
								<p className="text-xs font-medium">{movie.title}</p>
							</div>
						</div>
					</Link>
				))}
			</Marquee>
			<div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"></div>
			<div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"></div>
		</div>
	);
}
