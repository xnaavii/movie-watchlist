import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "#/features/auth/forms/LoginForm";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="size-full flex items-center justify-center p-6">
			<LoginForm />
		</div>
	);
}
