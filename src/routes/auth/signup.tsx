import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SignupForm } from "#/features/auth/forms/SignupForm";

const signupSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/signup")({
	component: SignupForm,
	validateSearch: signupSearchSchema,
});
