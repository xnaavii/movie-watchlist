import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "#/features/auth/forms/ForgotPasswordForm";
import { pageHead, pageTitle } from "#/utils/seo";

export const Route = createFileRoute("/auth/forgot-password")({
	head: () =>
		pageHead({
			title: pageTitle("Forgot your password"),
			noindex: true,
		}),
	component: ForgotPasswordForm,
});
