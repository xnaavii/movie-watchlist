import { createFileRoute } from "@tanstack/react-router";
import { SignupForm } from "#/features/auth/forms/SignupForm";

export const Route = createFileRoute("/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="size-full flex items-center justify-center p-6">
			<SignupForm />
		</div>
	);
}
