import type { ReactNode } from "react";
import { Button } from "#/components/ui/button";

type PickPillProps = {
	selected: boolean;
	onClick: () => void;
	children: ReactNode;
};

/** A toggle pill: outlined when off, high-contrast when on. */
export function PickPill({ selected, onClick, children }: PickPillProps) {
	return (
		<Button
			type="button"
			size="sm"
			variant={selected ? "contrast" : "outline"}
			aria-pressed={selected}
			onClick={onClick}
		>
			{children}
		</Button>
	);
}
