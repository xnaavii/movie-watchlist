import { Link } from "@tanstack/react-router";
import { AudioLines } from "lucide-react";
import { Button } from "#/components/ui/button";

export function AtmosShowcaseLink() {
	return (
		<section className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-primary/10 p-5 ring-1 ring-primary/30 md:p-6">
			<div className="flex items-start gap-4">
				<span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<AudioLines className="size-5" aria-hidden="true" />
				</span>
				<div className="flex flex-col gap-1">
					<h2 className="text-xl lg:text-2xl tracking-tighter">
						Dolby Atmos showcase
					</h2>
					<p className="text-sm text-muted-foreground text-pretty">
						Movies and series with great Atmos mixes, ranked by how they sound
						at home. Perfect for testing your speakers.
					</p>
				</div>
			</div>
			<Button asChild variant="contrast" className="w-fit">
				<Link to="/discover/atmos">Explore</Link>
			</Button>
		</section>
	);
}
