import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SignupForm } from "#/features/auth/forms/SignupForm";

const signupSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/signup")({
	component: SignupPage,
	validateSearch: signupSearchSchema,
});

function SignupPage() {
	return (
		<div className="size-full flex items-center justify-center p-6">
			<SignupForm />
		</div>
	);
}
