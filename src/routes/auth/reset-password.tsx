import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordForm } from "#/features/auth/forms/ResetPasswordForm";

const resetPasswordSearchSchema = z.object({
	token: z.string().optional(),
	error: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset-password")({
	component: ResetPasswordForm,
	validateSearch: resetPasswordSearchSchema,
});
