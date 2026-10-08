import { useRouter } from "@tanstack/react-router";
import { BackButton } from "./BackButton";

interface BackButtonViewProps {
	fallbackTo: string;
	className?: string;
}

export function BackButtonView({ fallbackTo, className }: BackButtonViewProps) {
	const router = useRouter();

	const handleBack = () => {
		if (router.history.canGoBack()) {
			router.history.back();
		} else {
			router.navigate({ to: fallbackTo });
		}
	};

	return <BackButton onBack={handleBack} className={className} />;
}
