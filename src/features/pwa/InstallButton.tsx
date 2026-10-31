import { Download, Share, SquarePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { useAppShell } from "./appShellStore";

/**
 * Offers to install Watchlist as an app. Hidden once installed or where the
 * browser can't install it. iOS gets the Add to Home Screen steps instead.
 */
export function InstallButton({ iconOnly = false }: { iconOnly?: boolean }) {
	const support = useAppShell((s) => s.installSupport);
	const install = useAppShell((s) => s.install);
	const [showSteps, setShowSteps] = useState(false);

	if (!support) return null;

	return (
		<>
			<Button
				size={iconOnly ? "icon-lg" : "sm"}
				variant={iconOnly ? "ghost" : "contrast"}
				title="Install Watchlist as an app"
				onClick={() => (support === "ios" ? setShowSteps(true) : install())}
			>
				<Download aria-hidden="true" />
				<span className={iconOnly ? "sr-only" : "max-[420px]:sr-only"}>
					Get the app
				</span>
			</Button>
			<Dialog open={showSteps} onOpenChange={setShowSteps}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Watchlist to your Home Screen</DialogTitle>
						<DialogDescription>
							It opens full screen like any other app, with your watchlist one
							tap away, and works offline.
						</DialogDescription>
					</DialogHeader>
					<ol className="flex flex-col gap-3">
						<li className="flex items-center gap-3">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
								<Share className="size-4" aria-hidden="true" />
							</span>
							<span>
								Tap <strong>Share</strong> in Safari's toolbar.
							</span>
						</li>
						<li className="flex items-center gap-3">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
								<SquarePlus className="size-4" aria-hidden="true" />
							</span>
							<span>
								Choose <strong>Add to Home Screen</strong>, then{" "}
								<strong>Add</strong>.
							</span>
						</li>
					</ol>
				</DialogContent>
			</Dialog>
		</>
	);
}
