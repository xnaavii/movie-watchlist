import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "#/components/ui/skeleton";
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

	const logo = images?.logos[0].file_path;

	return (
		<div className={className} title={title}>
			{isLoading ? (
				<Skeleton className="w-[clamp(10rem,12vw,40rem)] h-16 md:h-20" />
			) : !isError && logo ? (
				<div className="relative inline-block self-start">
					<div className="absolute inset-0 bg-background/20 blur-2xl rounded-full scale-200" />
					<img
						src={logo}
						alt={title}
						className="relative w-[clamp(12rem,14vw,40rem)] object-contain drop-shadow-2xl"
						loading="eager"
						fetchPriority="high"
					/>
				</div>
			) : null}
		</div>
	);
}
