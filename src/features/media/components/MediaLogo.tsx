import { cn } from "#/lib/utils";

interface MediaLogoProps {
	logoSrc: string | undefined;
	title: string;
	isLoading?: boolean;
	className?: string;
	imageClassName?: string;
	/**
	 * Logos are mostly white. Over a photo they stay white; over the page
	 * background they turn black in light mode so they stay visible.
	 */
	overBackground?: boolean;
}

export function MediaLogo({
	logoSrc,
	title,
	className,
	imageClassName,
	overBackground = false,
}: MediaLogoProps) {
	return (
		<div className={className} title={title}>
			{logoSrc ? (
				<div className="relative inline-block self-start">
					<div
						className={cn(
							"absolute inset-0 blur-2xl rounded-full scale-200",
							overBackground ? "bg-background/20" : "bg-black/20",
						)}
					/>
					<img
						src={logoSrc}
						alt={title}
						className={cn(
							"relative w-[clamp(12rem,14vw,40rem)] object-contain drop-shadow-2xl",
							overBackground && "brightness-0 dark:brightness-100",
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
