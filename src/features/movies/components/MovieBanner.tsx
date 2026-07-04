import { useEffect, useRef, useState } from "react";
import { getMovieImage } from "#/features/movies/utils/tmdb";

type MovieBannerProps = {
	backdropPath: string | null;
	title: string;
	children?: React.ReactNode;
};

export default function MovieBanner({
	backdropPath,
	title,
	children,
}: MovieBannerProps) {
	const [isLoaded, setIsLoaded] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);

	const backdropTiny = getMovieImage(backdropPath, "w92");
	const backdropFull = getMovieImage(backdropPath, "w1280");

	useEffect(() => {
		if (imgRef.current?.complete) {
			setIsLoaded(true);
		}
	}, []);

	return (
		<div className="relative w-full min-h-150 h-[60vh] bg-neutral-950">
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-0 left-0 size-full bg-linear-to-t from-black to-transparent z-1" />
				{backdropFull ? (
					<>
						{backdropTiny && (
							<img
								src={backdropTiny}
								alt=""
								aria-hidden="true"
								className={`absolute size-full object-cover blur-xl scale-105 transition-opacity duration-300 ${
									isLoaded ? "opacity-0" : "opacity-100"
								}`}
							/>
						)}
						<img
							ref={imgRef}
							src={backdropFull}
							alt={title}
							fetchPriority="high"
							onLoad={() => setIsLoaded(true)}
							className={`absolute size-full object-cover transition-opacity duration-500 ${
								isLoaded ? "opacity-100" : "opacity-0"
							}`}
						/>
					</>
				) : (
					<div className="absolute inset-0 bg-muted flex items-center justify-center text-xl text-muted-foreground">
						No image
					</div>
				)}
			</div>

			{children}
		</div>
	);
}
