import type { MovieResultItem } from "@lorenzopant/tmdb";
import { Link } from "@tanstack/react-router";
import { ListPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";

const TIMER_INTERVAL = 5000;

export function FeaturedMovies({ movies }: { movies: MovieResultItem[] }) {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const timerId = setTimeout(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex === movies.length - 1 ? 0 : prevIndex + 1,
			);
		}, TIMER_INTERVAL);

		return () => {
			clearTimeout(timerId);
		};
	}, [movies.length]);

	if (movies.length === 0) {
		return null;
	}

	const movie = movies[currentIndex];

	return (
		<div className="relative bg-muted h-[60vh] overflow-hidden">
			{movie.backdrop_path ? (
				<img
					src={movie.backdrop_path}
					alt={movie.title}
					className="size-full object-cover object-top"
				/>
			) : (
				<p>No Image</p>
			)}
			<div className="absolute inset-0 bg-linear-to-t from-black to-transparent z-1" />
			<div className="absolute inset-0 p-2 md:p-6 flex flex-col gap-6 max-w-5xl justify-end z-9">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-4xl md:text-5xl min-w-0">
						{movie.title}
					</h1>
					<p className="text text-muted-foreground">{movie.overview}</p>
				</div>
				<div className="flex gap-2">
					<Button size="lg">
						<ListPlus />
						Add to watchlist
					</Button>

					<Button variant="secondary" asChild size="lg">
						<Link to="/movies/$id" params={{ id: `${movie.id}` }}>
							Details
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
