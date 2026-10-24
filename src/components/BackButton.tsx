import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "#/lib/utils.ts";

interface BackButtonProps {
	className?: string;
	onBack?: () => void;
}

export function BackButton({ className, onBack }: BackButtonProps) {
	return (
		<Button
			size="icon"
			variant="secondary"
			onClick={onBack}
			className={cn("!rounded-full rounded-full", className)}
		>
			<ChevronLeft />
		</Button>
	);
}
