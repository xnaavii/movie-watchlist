import { queryOptions, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookmarkPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { getMovieListFn } from "../server/movies.functions";
import { getMovieImage } from "../utils/tmdb";
import { HeroSlideshowSkeleton } from "./HeroSlideshowSkeleton";

const heroQuery = queryOptions({
	queryKey: ["movies", "now_playing", "en-US", 1, "hero"],
	queryFn: () =>
		getMovieListFn({
			data: { list: "now_playing", language: "en-US", page: 1 },
		}),
});

const TIMER_INTERVAL = 5000;

export function HeroSlideshow() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const { data, isPending, error } = useQuery(heroQuery);

	const movies = data?.success ? data.data.results.slice(0, 3) : [];

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

	if (isPending) {
		return <HeroSlideshowSkeleton />;
	}

	if (error) {
		return <p>There was an error</p>;
	}

	if (movies.length === 0) {
		return null;
	}

	const movie = movies[currentIndex];

	const backdropImage = getMovieImage(movie.backdrop_path, "w1280");

	return (
		<div className="relative bg-muted min-h-150 h-[60vh] overflow-hidden">
			{backdropImage ? (
				<img
					src={backdropImage}
					alt={movie.title}
					className="size-full object-cover"
				/>
			) : (
				<p>No Image</p>
			)}
			<div className="absolute inset-0 bg-linear-to-t from-black to-transparent z-1" />
			<div className="absolute inset-0 max-w-2xl p-6 flex flex-col gap-4 justify-end z-9">
				<h1 className="text-4xl font-semibold drop-shadow-lg">{movie.title}</h1>
				<p className="text-secondary">{movie.overview}</p>
				<div className="flex gap-2">
					<Button>
						<BookmarkPlus />
						Add to watchlist
					</Button>

					<Button variant="secondary" asChild>
						<Link to="/movies/$id" params={{ id: `${movie.id}` }}>
							Details
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
