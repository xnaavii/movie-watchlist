import { ImageOff } from "lucide-react";
import type { ReactNode } from "react";

interface MovieBackdropImageProps {
	src?: string;
	alt: string;
	children?: ReactNode;
}

export function MovieBackdropImage({
	src,
	alt,
	children,
}: MovieBackdropImageProps) {
	return (
		<div className="relative w-full h-[clamp(30vh,90vh+10svh,100vh)] p-4 md:p-6 lg:p-8">
			<div className="absolute inset-0 size-full bg-linear-to-b from-transparent via-background via-90% to-background z-10"></div>
			{src ? (
				<img
					src={src}
					alt={alt}
					className="absolute inset-0 object-cover size-full object-top"
				/>
			) : (
				<div className="inset-0 size-full bg-muted flex flex-col items-center justify-center">
					<ImageOff />
					<p className="text-xl text-muted-foreground">No Image</p>
				</div>
			)}
			{children}
		</div>
	);
}
