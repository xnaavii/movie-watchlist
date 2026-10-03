interface MovieBackdropImageProps {
	src?: string;
	title: string;
}

export function MovieBackdropImage({ src, title }: MovieBackdropImageProps) {
	return (
		<div className="relative min-h-svh h-full w-full">
			<div className="absolute inset-0 size-full bg-radial-[at_120%_20%] from-transparent to-background to-60% z-10"></div>
			<div className="absolute inset-0 size-full bg-linear-to-b from-transparent via-transparent to-background z-10"></div>
			<img
				src={src}
				alt={`${title}'s backdrop`}
				className="absolute inset-0 object-cover size-full"
			/>
		</div>
	);
}
