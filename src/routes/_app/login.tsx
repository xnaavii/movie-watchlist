import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LoginForm } from "#/features/auth/forms/LoginForm";

const loginSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/_app/login")({
	component: LoginPage,
	validateSearch: loginSearchSchema,
});

function LoginPage() {
	return (
		<div className="size-full flex items-center justify-center p-6">
			<LoginForm />
		</div>
	);
}
