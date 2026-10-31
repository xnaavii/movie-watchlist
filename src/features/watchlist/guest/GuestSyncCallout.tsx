import { Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

/**
 * Tells a signed-out visitor their list lives on this device, and that an
 * account syncs it across devices. Hidden when signed in.
 */
export function GuestSyncCallout() {
	const { data: session, isPending } = authClient.useSession();
	if (isPending || session) return null;

	return (
		<section className="flex flex-col gap-4 rounded-3xl bg-primary/10 p-5 ring-1 ring-primary/30 md:flex-row md:items-center md:justify-between md:p-6">
			<div className="flex items-start gap-4">
				<span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<RefreshCw className="size-5" aria-hidden="true" />
				</span>
				<div className="flex flex-col gap-1">
					<h2 className="text-lg tracking-tight">
						Saved on this device only
					</h2>
					<p className="text-sm text-muted-foreground text-pretty">
						Create a free account to sync your watchlist across devices.
						Everything you've saved here moves over when you sign up or log in.
					</p>
				</div>
			</div>
			<div className="flex shrink-0 gap-2">
				<Button asChild variant="contrast">
					<Link to="/auth/signup" search={{ redirect: "/watchlist" }}>
						Create account
					</Link>
				</Button>
				<Button asChild variant="ghost">
					<Link to="/auth/login" search={{ redirect: "/watchlist" }}>
						Log in
					</Link>
				</Button>
			</div>
		</section>
	);
}
