import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LoginForm } from "#/features/auth/forms/LoginForm";
import { pageHead, pageTitle } from "#/utils/seo";

const loginSearchSchema = z.object({
	redirect: z.string().optional(),
	// Set by Better Auth when a Google sign in fails
	error: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
	head: () =>
		pageHead({
			title: pageTitle("Sign in"),
			description: "Sign in to keep your watchlist in sync on every device.",
			noindex: true,
		}),
	component: LoginForm,
	validateSearch: loginSearchSchema,
});
