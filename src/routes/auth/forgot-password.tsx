import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "#/features/auth/forms/ForgotPasswordForm";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordForm,
});
