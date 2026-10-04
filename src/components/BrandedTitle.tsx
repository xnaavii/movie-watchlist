import type { ReactNode } from "react";

interface BrandedTitleProps {
	children: ReactNode;
}

export function BrandedTitle({ children }: BrandedTitleProps) {
	return (
		<div className="relative w-fit isolate">
			<h1 className="text-2xl lg:text-3xl tracking-tight font-medium">
				{children}
			</h1>
			<div className="absolute bottom-0 translate-y-1/5 right-0 w-full scale-x-110 scale-y-120 h-3 -rotate-4 skew-3 bg-primary -z-10"></div>
		</div>
	);
}
