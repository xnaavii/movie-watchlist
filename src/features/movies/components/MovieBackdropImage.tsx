interface MovieBackdropImageProps {
	src?: string;
	title: string;
}

export function MovieBackdropImage({ src, title }: MovieBackdropImageProps) {
	return (
		<div className="relative aspect-video w-full md:aspect-auto md:min-h-svh md:h-full">
			<div className="absolute inset-0 size-full hidden md:block bg-radial-[at_100%_0%] from-transparent from-30% to-background/70 to-90% z-10"></div>
			<div className="absolute inset-0 size-full hidden md:block bg-linear-to-r from-background/85 via-background/50 via-40% to-transparent to-75% z-10"></div>
			<div className="absolute inset-0 size-full bg-linear-to-b from-transparent via-transparent to-background z-10"></div>
			<img
				src={src}
				alt={`${title}'s backdrop`}
				className="absolute inset-0 object-cover size-full"
			/>
		</div>
	);
}
