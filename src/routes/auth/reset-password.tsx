import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordForm } from "#/features/auth/forms/ResetPasswordForm";
import { pageHead, pageTitle } from "#/utils/seo";

const resetPasswordSearchSchema = z.object({
	token: z.string().optional(),
	error: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset-password")({
	head: () =>
		pageHead({
			title: pageTitle("Reset your password"),
			noindex: true,
		}),
	component: ResetPasswordForm,
	validateSearch: resetPasswordSearchSchema,
});
