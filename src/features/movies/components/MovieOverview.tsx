import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTrigger,
} from "#/components/ui/dialog";
import { cn } from "#/lib/utils";

interface MovieOverviewProps {
	overview: string;
	className?: string;
}

export function MovieOverview({ overview, className }: MovieOverviewProps) {
	return (
		<div className={cn("flex items-end wrap-normal", className)}>
			<p className="text-muted-foreground line-clamp-2">{overview}</p>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="secondary" size="sm">
						Read More
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogDescription>Movie Overview</DialogDescription>
					</DialogHeader>
					<p className="text-base">{overview}</p>
				</DialogContent>
			</Dialog>
		</div>
	);
}
