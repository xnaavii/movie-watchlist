import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SignupForm } from "#/features/auth/forms/SignupForm";
import { pageHead, pageTitle } from "#/utils/seo";

const signupSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/signup")({
	head: () =>
		pageHead({
			title: pageTitle("Create your account"),
			description:
				"Create a free account to keep your watchlist in sync on every device.",
			noindex: true,
		}),
	component: SignupForm,
	validateSearch: signupSearchSchema,
});
