import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

export function BackButton() {
	const router = useRouter();

	return (
		<Button size="icon" variant="outline" onClick={() => router.history.back()}>
			<ChevronLeft />
		</Button>
	);
}
