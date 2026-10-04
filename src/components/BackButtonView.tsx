import { useRouter } from "@tanstack/react-router";
import { BackButton } from "./BackButton";

interface BackButtonViewProps {
	to: string;
	className?: string;
}

export function BackButtonView({ to, className }: BackButtonViewProps) {
	const router = useRouter();

	return (
		<BackButton onBack={() => router.navigate({ to })} className={className} />
	);
}
