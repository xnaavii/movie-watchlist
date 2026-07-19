import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "../queries";

interface MovieLogoProps {
	tmdbId: number;
	title: string;
	className?: string;
}

export function MovieLogo({ tmdbId, title, className }: MovieLogoProps) {
	const {
		data: images,
		isLoading,
		isError,
	} = useQuery(movieQueries.images({ movie_id: tmdbId }));

	return (
		<div className={className} title={title}>
			{!isLoading && !isError && images?.logos?.[0] ? (
				<div className="relative inline-block self-start">
					<div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-150" />
					<img
						src={`https://image.tmdb.org/t/p/original${images.logos[0].file_path}`}
						alt={title}
						className="relative w-[clamp(10rem,12vw,40rem)] object-contain"
					/>
				</div>
			) : (
				<p className="font-semibold text-2xl md:text-3xl min-w-0">{title}</p>
			)}
		</div>
	);
}
