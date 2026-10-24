import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "#/components/ui/card";

interface StatTileProps {
	label: string;
	value: ReactNode;
	detail?: ReactNode;
	icon: LucideIcon;
}

export function StatTile({ label, value, detail, icon: Icon }: StatTileProps) {
	return (
		<Card size="sm" className="px-5 gap-3">
			<div className="flex items-center gap-2 text-muted-foreground">
				<Icon className="size-4" />
				<span className="text-xs font-medium uppercase tracking-wide">
					{label}
				</span>
			</div>
			<p className="text-3xl font-semibold tracking-tight tabular-nums">
				{value}
			</p>
			{detail && <p className="text-xs text-muted-foreground">{detail}</p>}
		</Card>
	);
}
