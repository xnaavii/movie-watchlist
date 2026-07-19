import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTrigger,
} from "#/components/ui/dialog";

export function MovieOverview({ overview }: { overview: string }) {
	return (
		<div className="flex items-end wrap-normal">
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
