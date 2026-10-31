import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Container } from "#/components/Container";
import { AccountDataSection } from "#/features/account/components/AccountDataSection";
import { ProfileDashboard } from "#/features/profile/components/ProfileDashboard";
import { ProfileHeader } from "#/features/profile/components/ProfileHeader";
import { watchlistQueries } from "#/features/watchlist/queries";
import { authClient } from "#/lib/auth-client";
import { pageHead, pageTitle } from "#/utils/seo";

export const Route = createFileRoute("/_app/_protected/profile")({
	component: ProfilePage,
	head: () =>
		pageHead({
			title: pageTitle("Your profile"),
			description:
				"Your watching stats, and where to download or delete your data.",
			noindex: true,
		}),
	pendingComponent: ProfilePending,
	loader: async ({ context }) => {
		await context.queryClient.query({
			...watchlistQueries.stats(),
			staleTime: "static",
		});
	},
});

function ProfilePage() {
	const { user } = Route.useRouteContext();
	const router = useRouter();
	const { data: stats } = useSuspenseQuery(watchlistQueries.stats());

	const logout = async () => {
		await authClient.signOut();
		await router.invalidate();
	};

	return (
		<Container className="gap-6 md:gap-8 lg:gap-10">
			<ProfileHeader user={user} onLogout={logout} />
			<ProfileDashboard stats={stats} />
			<AccountDataSection />
		</Container>
	);
}

function ProfilePending() {
	return (
		<Container className="gap-6 md:gap-8 lg:gap-10 animate-pulse">
			<div className="flex items-center gap-4">
				<div className="size-14 rounded-full bg-muted" />
				<div className="flex flex-col gap-2">
					<div className="h-7 w-40 rounded bg-muted" />
					<div className="h-4 w-56 rounded bg-muted" />
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
				{["watched", "time", "score", "to-watch"].map((key) => (
					<div key={key} className="h-32 rounded-4xl bg-muted" />
				))}
			</div>
			<div className="h-80 rounded-4xl bg-muted" />
		</Container>
	);
}
