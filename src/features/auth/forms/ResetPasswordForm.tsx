import { useForm } from "@tanstack/react-form";
import { getRouteApi, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";

const formSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(128, "Password must be at most 128 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

const routeApi = getRouteApi("/auth/reset-password");

export function ResetPasswordForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const router = useRouter();
	const { token, error } = routeApi.useSearch();

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const { error } = await authClient.resetPassword({
				newPassword: value.password,
				token,
			});

			if (error) {
				toast.error(`Message: ${error.message}, Status: ${error.status}`);
			} else {
				router.history.push("/auth/login");
				toast.success("Password updated. You can now log in.");
			}
		},
	});

	if (error || !token) {
		return (
			<div className={cn("flex flex-col gap-6", className)}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-1 text-center">
						<h1 className="text-2xl font-bold">Link is invalid or expired</h1>
						<p className="text-sm text-balance text-muted-foreground">
							Request a new password reset link and try again
						</p>
					</div>
					<Field>
						<Button asChild>
							<Link to="/auth/forgot-password">Request a new link</Link>
						</Button>
					</Field>
					<FieldSeparator></FieldSeparator>
					<Field>
						<FieldDescription className="text-center">
							<Link to="/auth/login">Back to login</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</div>
		);
	}

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			id="reset-password-form"
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Set a new password</h1>
					<p className="text-sm text-balance text-muted-foreground">
						Choose a new password for your account
					</p>
				</div>
				<form.Field name="password">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>New Password</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Enter new password"
									type="password"
								/>

								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<form.Field name="confirmPassword">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Enter your new password again"
									type="password"
								/>

								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<Field>
					<form.Subscribe>
						{({ canSubmit, isSubmitting }) => (
							<Button
								type="submit"
								form="reset-password-form"
								disabled={!canSubmit}
							>
								{isSubmitting ? "Updating password..." : "Update password"}
							</Button>
						)}
					</form.Subscribe>
				</Field>
			</FieldGroup>
		</form>
	);
}
