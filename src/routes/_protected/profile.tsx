import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "#/lib/auth.functions";

export const Route = createFileRoute("/_protected/profile")({
	beforeLoad: async () => {
		const session = await getSession();

		if (!session) {
			throw redirect({ to: "/login" });
		}

		return { user: session.user };
	},
	component: ProfilePage,
});

function ProfilePage() {
	const { user } = Route.useRouteContext();

	return <div>Logged in as, {user.name}!</div>;
}
