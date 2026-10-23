import { VenetianMask } from "lucide-react";
import { cn } from "#/lib/utils";

interface BrandMarkProps {
	className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
	return (
		<VenetianMask className={cn("size-4 text-sidebar-primary", className)} />
	);
}
