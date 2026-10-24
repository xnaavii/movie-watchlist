import { cn } from "#/lib/utils";

interface MediaLogoProps {
	logoSrc: string | undefined;
	title: string;
	isLoading?: boolean;
	className?: string;
	imageClassName?: string;
}

export function MediaLogo({
	logoSrc,
	title,
	className,
	imageClassName,
}: MediaLogoProps) {
	return (
		<div className={className} title={title}>
			{logoSrc ? (
				<div className="relative inline-block self-start">
					<div className="absolute inset-0 bg-background/20 blur-2xl rounded-full scale-200" />
					<img
						src={logoSrc}
						alt={title}
						className={cn(
							"relative w-[clamp(12rem,14vw,40rem)] object-contain drop-shadow-2xl",
							imageClassName,
						)}
						loading="eager"
						fetchPriority="high"
					/>
				</div>
			) : null}
		</div>
	);
}
