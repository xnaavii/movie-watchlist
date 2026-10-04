import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

interface ContainerProps {
	children?: ReactNode;
	className?: string;
}

export function Container({ children, className }: ContainerProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-8 md:gap-12 lg:gap-16 p-4 md:p-6 lg:p-8 mt-12 md:mt-0 bg-background",
				className,
			)}
		>
			{children}
		</div>
	);
}
