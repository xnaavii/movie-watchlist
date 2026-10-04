import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface BackButtonProps {
	className?: string;
}

export function BackButton({ className }: BackButtonProps) {
	const router = useRouter();

	return (
		<Button
			size="icon"
			variant="secondary"
			onClick={() => router.history.back()}
			className={className}
		>
			<ChevronLeft />
		</Button>
	);
}
