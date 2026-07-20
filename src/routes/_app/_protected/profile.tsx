import { createFileRoute, useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/_app/_protected/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const { user } = Route.useRouteContext();
	const router = useRouter();

	const logout = async () => {
		await authClient.signOut();
		await router.invalidate();
	};

	return (
		<div className="mt-10 p-2 md:p-6 md:mt-0">
			<div className="flex items-center justify-between">
				<p>Logged in as, {user.name}!</p>
				<Button variant="destructive" onClick={logout}>
					Log out
					<LogOut />
				</Button>
			</div>
		</div>
	);
}
