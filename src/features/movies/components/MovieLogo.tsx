interface MovieLogoProps {
	logoSrc: string | undefined;
	title: string;
	isLoading?: boolean;
	className?: string;
}

export function MovieLogo({ logoSrc, title, className }: MovieLogoProps) {
	return (
		<div className={className} title={title}>
			{logoSrc ? (
				<div className="relative inline-block self-start">
					<div className="absolute inset-0 bg-background/20 blur-2xl rounded-full scale-200" />
					<img
						src={logoSrc}
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
