import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
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

const formSchema = z.object({
	email: z.email("Please enter a valid email address"),
});

export function ForgotPasswordForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const [sentTo, setSentTo] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const { error } = await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: "/auth/reset-password",
			});

			if (error) {
				toast.error(`Message: ${error.message}, Status: ${error.status}`);
			} else {
				setSentTo(value.email);
			}
		},
	});

	if (sentTo) {
		return (
			<div className={cn("flex flex-col gap-6", className)}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-1 text-center">
						<h1 className="text-2xl font-bold">Check your email</h1>
						<p className="text-sm text-balance text-muted-foreground">
							If an account exists for {sentTo}, you&apos;ll receive a link to
							reset your password. The link expires in 1 hour.
						</p>
					</div>
					<Field>
						<Button variant="outline" onClick={() => setSentTo(null)}>
							Use a different email
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
			id="forgot-password-form"
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Forgot your password?</h1>
					<p className="text-sm text-balance text-muted-foreground">
						Enter your email and we&apos;ll send you a link to reset it
					</p>
				</div>
				<form.Field name="email">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Enter your email address"
									type="email"
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
								form="forgot-password-form"
								disabled={!canSubmit}
							>
								{isSubmitting ? "Sending reset link..." : "Send reset link"}
							</Button>
						)}
					</form.Subscribe>
				</Field>
				<FieldSeparator></FieldSeparator>
				<Field>
					<FieldDescription className="text-center">
						Remembered your password? <Link to="/auth/login">Log in</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}
