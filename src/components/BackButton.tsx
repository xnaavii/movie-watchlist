import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

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
			className={className}
		>
			<ChevronLeft />
		</Button>
	);
}
